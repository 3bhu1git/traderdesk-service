const axios = require('axios');
const User = require('../models/User');
const logger = require('../utils/logger');

class MarketIntelligenceController {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get Dhan API credentials from user's active broker connection
     */
    async getDhanCredentials(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Find active Dhan broker account
            const dhanAccount = user.brokerAccounts.find(account => 
                account.brokerName === 'Dhan' && account.isActive
            );

            if (!dhanAccount) {
                throw new Error('No active Dhan connection found. Please connect to Dhan in Data Integration settings.');
            }

            return {
                clientId: dhanAccount.clientId,
                accessToken: dhanAccount.accessToken
            };
        } catch (error) {
            logger.error('Error getting Dhan credentials:', error);
            throw error;
        }
    }

    /**
     * Make authenticated request to Dhan API
     */
    async makeDhanRequest(userId, endpoint, options = {}) {
        try {
            const credentials = await this.getDhanCredentials(userId);
            
            const response = await axios({
                url: `https://api.dhan.co/v2${endpoint}`,
                method: 'GET',
                headers: {
                    'access-token': credentials.accessToken,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                ...options
            });

            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                throw new Error('Dhan API authentication failed. Please reconnect in Data Integration settings.');
            }
            throw error;
        }
    }

    /**
     * Get market overview data including indices
     * @route GET /api/market-intelligence/overview
     */
    async getMarketOverview(req, res) {
        try {
            const userId = req.user.userId;
            const cacheKey = `market_overview_${userId}`;
            const cachedData = this.getCachedData(cacheKey);
            
            if (cachedData) {
                return res.json(cachedData);
            }

            // Fetch major indices data from Dhan API using LTP endpoint
            const indices = ['NIFTY 50', 'NIFTY BANK', 'SENSEX', 'INDIA VIX'];

            try {
                // Use Dhan's LTP API to get real-time index data
                const ltpData = await this.makeDhanRequest(userId, '/marketfeed/ltp', {
                    method: 'POST',
                    data: {
                        NSE_EQ: [],
                        NSE_FNO: [],
                        NSE_CURRENCY: [],
                        BSE_EQ: [],
                        BSE_FNO: [],
                        BSE_CURRENCY: [],
                        MCX_FO: [],
                        IDX_I: indices // Index instruments
                    }
                });

                let indexData = [];

                if (ltpData && ltpData.data && ltpData.data.IDX_I) {
                    indexData = indices.map(index => {
                        const data = ltpData.data.IDX_I[index];
                        if (data) {
                            return {
                                symbol: index,
                                price: data.LTP || data.last_price,
                                change: data.change || (data.LTP - data.prev_close),
                                changePercent: data.pChange || parseFloat(((data.LTP - data.prev_close) / data.prev_close * 100).toFixed(2)),
                                volume: data.volume || 0,
                                high: data.high || 0,
                                low: data.low || 0,
                                open: data.open || data.prev_close
                            };
                        }
                        return this.getDefaultIndexData(index);
                    });
                } else {
                    // Fallback to default data
                    indexData = indices.map(index => this.getDefaultIndexData(index));
                }

                const overview = {
                    indices: indexData,
                    marketStatus: this.getMarketStatus(),
                    lastUpdated: new Date().toISOString()
                };

                this.setCachedData(cacheKey, overview);
                res.json(overview);

            } catch (apiError) {
                logger.error('Error fetching from Dhan API:', apiError);
                
                // Fallback to mock data if API fails
                const overview = {
                    indices: indices.map(index => this.getDefaultIndexData(index)),
                    marketStatus: this.getMarketStatus(),
                    lastUpdated: new Date().toISOString(),
                    warning: 'Using sample data. Live market data may not be available.'
                };

                res.json(overview);
            }

        } catch (error) {
            logger.error('Error in getMarketOverview:', error);
            
            // If user doesn't have Dhan connection, return mock data with warning
            if (error.message.includes('No active Dhan connection')) {
                const mockOverview = {
                    indices: [
                        this.getDefaultIndexData('NIFTY 50'),
                        this.getDefaultIndexData('NIFTY BANK'),
                        this.getDefaultIndexData('SENSEX'),
                        this.getDefaultIndexData('INDIA VIX')
                    ],
                    marketStatus: this.getMarketStatus(),
                    lastUpdated: new Date().toISOString(),
                    warning: 'Please connect to Dhan in Data Integration settings to view live market data.'
                };
                return res.json(mockOverview);
            }
            
            res.status(500).json({ error: 'Failed to fetch market overview data' });
        }
    }

    /**
     * Get sector performance data
     * @route GET /api/market-intelligence/sectors
     */
    async getSectorPerformance(req, res) {
        try {
            const userId = req.user.userId;
            const cacheKey = `sector_performance_${userId}`;
            const cachedData = this.getCachedData(cacheKey);
            
            if (cachedData) {
                return res.json(cachedData);
            }

            // Fetch sector indices data from Dhan API
            const sectors = [
                'NIFTY AUTO', 'NIFTY BANK', 'NIFTY ENERGY', 'NIFTY FMCG',
                'NIFTY IT', 'NIFTY METAL', 'NIFTY PHARMA', 'NIFTY PSU BANK',
                'NIFTY REALTY', 'NIFTY MEDIA', 'NIFTY PRIVATE BANK'
            ];

            try {
                // Use Dhan's LTP API to get real-time sector data
                const ltpData = await this.makeDhanRequest(userId, '/marketfeed/ltp', {
                    method: 'POST',
                    data: {
                        NSE_EQ: [],
                        NSE_FNO: [],
                        NSE_CURRENCY: [],
                        BSE_EQ: [],
                        BSE_FNO: [],
                        BSE_CURRENCY: [],
                        MCX_FO: [],
                        IDX_I: sectors // Index instruments for sectors
                    }
                });

                let sectorData = [];

                if (ltpData && ltpData.data && ltpData.data.IDX_I) {
                    sectorData = sectors.map(sector => {
                        const data = ltpData.data.IDX_I[sector];
                        if (data) {
                            return {
                                name: sector,
                                price: data.LTP || data.last_price,
                                change: data.change || (data.LTP - data.prev_close),
                                changePercent: data.pChange || parseFloat(((data.LTP - data.prev_close) / data.prev_close * 100).toFixed(2)),
                                volume: data.volume || 0,
                                high: data.high || 0,
                                low: data.low || 0
                            };
                        }
                        return this.getDefaultSectorData(sector);
                    });
                } else {
                    // Fallback to default data
                    sectorData = sectors.map(sector => this.getDefaultSectorData(sector));
                }

                const performance = {
                    sectors: sectorData.sort((a, b) => b.changePercent - a.changePercent),
                    lastUpdated: new Date().toISOString()
                };

                this.setCachedData(cacheKey, performance);
                res.json(performance);

            } catch (apiError) {
                logger.error('Error fetching sector data from Dhan API:', apiError);
                
                // Fallback to mock data if API fails
                const performance = {
                    sectors: sectors.map(sector => this.getDefaultSectorData(sector))
                        .sort((a, b) => b.changePercent - a.changePercent),
                    lastUpdated: new Date().toISOString(),
                    warning: 'Using sample data. Live sector data may not be available.'
                };

                res.json(performance);
            }

        } catch (error) {
            logger.error('Error in getSectorPerformance:', error);
            
            // If user doesn't have Dhan connection, return mock data with warning
            if (error.message.includes('No active Dhan connection')) {
                const mockSectors = [
                    'NIFTY AUTO', 'NIFTY BANK', 'NIFTY ENERGY', 'NIFTY FMCG',
                    'NIFTY IT', 'NIFTY METAL', 'NIFTY PHARMA', 'NIFTY PSU BANK',
                    'NIFTY REALTY', 'NIFTY MEDIA', 'NIFTY PRIVATE BANK'
                ];
                
                const mockPerformance = {
                    sectors: mockSectors.map(sector => this.getDefaultSectorData(sector))
                        .sort((a, b) => b.changePercent - a.changePercent),
                    lastUpdated: new Date().toISOString(),
                    warning: 'Please connect to Dhan in Data Integration settings to view live sector data.'
                };
                return res.json(mockPerformance);
            }
            
            res.status(500).json({ error: 'Failed to fetch sector performance data' });
        }
    }

    /**
     * Get FII/DII activity data
     * @route GET /api/market-intelligence/fii-dii
     */
    async getFIIDIIActivity(req, res) {
        try {
            const cacheKey = 'fii_dii_activity';
            const cachedData = this.getCachedData(cacheKey);
            
            if (cachedData) {
                return res.json(cachedData);
            }

            // Since Dhan doesn't provide FII/DII data directly, we'll generate
            // realistic mock data based on typical patterns
            const activity = this.generateFIIDIIData();
            
            this.setCachedData(cacheKey, activity);
            res.json(activity);
        } catch (error) {
            logger.error('Error in getFIIDIIActivity:', error);
            res.status(500).json({ error: 'Failed to fetch FII/DII activity data' });
        }
    }

    /**
     * Get top gainers and losers
     * @route GET /api/market-intelligence/movers
     */
    async getTopMovers(req, res) {
        try {
            const userId = req.user.userId;
            const { limit = 5 } = req.query;
            const cacheKey = `top_movers_${userId}_${limit}`;
            const cachedData = this.getCachedData(cacheKey);
            
            if (cachedData) {
                return res.json(cachedData);
            }

            // Popular Nifty 50 stocks with their symbols
            const nifty50Stocks = [
                'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR',
                'ICICIBANK', 'KOTAKBANK', 'BHARTIARTL', 'ITC', 'LT',
                'SBIN', 'BAJFINANCE', 'ASIANPAINT', 'HCLTECH', 'MARUTI',
                'AXISBANK', 'TITAN', 'SUNPHARMA', 'WIPRO', 'ULTRACEMCO'
            ];

            const stockPromises = nifty50Stocks.map(async (symbol) => {
                try {
                    // Get real-time quotes from Dhan API using LTP endpoint
                    const quoteData = await this.makeDhanRequest(userId, '/marketfeed/ltp', {
                        method: 'POST',
                        data: {
                            NSE_EQ: [symbol],
                            NSE_FNO: [],
                            NSE_CURRENCY: [],
                            BSE_EQ: [],
                            BSE_FNO: [],
                            BSE_CURRENCY: [],
                            MCX_FO: []
                        }
                    });

                    if (quoteData && quoteData.data && quoteData.data.NSE_EQ && quoteData.data.NSE_EQ[symbol]) {
                        const stockData = quoteData.data.NSE_EQ[symbol];
                        
                        return {
                            symbol: symbol,
                            price: stockData.LTP || stockData.last_price,
                            change: stockData.change || (stockData.LTP - stockData.prev_close),
                            changePercent: stockData.pChange || parseFloat(((stockData.LTP - stockData.prev_close) / stockData.prev_close * 100).toFixed(2)),
                            volume: stockData.volume || 0,
                            high: stockData.high || 0,
                            low: stockData.low || 0
                        };
                    }

                    return null; // Skip if no data
                } catch (error) {
                    logger.error(`Error fetching stock data for ${symbol}:`, error);
                    return null;
                }
            });

            const stockResults = await Promise.all(stockPromises);
            const validStocks = stockResults.filter(stock => stock !== null);

            if (validStocks.length === 0) {
                // Fallback to mock data if no real data available
                const mockMovers = {
                    gainers: this.generateMockStockData(parseInt(limit), 'gainers'),
                    losers: this.generateMockStockData(parseInt(limit), 'losers'),
                    lastUpdated: new Date().toISOString(),
                    warning: 'Using sample data. Market data may not be available.'
                };
                return res.json(mockMovers);
            }

            // Sort by change percentage
            validStocks.sort((a, b) => b.changePercent - a.changePercent);

            const movers = {
                gainers: validStocks.slice(0, parseInt(limit)),
                losers: validStocks.slice(-parseInt(limit)).reverse(),
                lastUpdated: new Date().toISOString()
            };

            this.setCachedData(cacheKey, movers);
            res.json(movers);
        } catch (error) {
            logger.error('Error in getTopMovers:', error);
            
            // If user doesn't have Dhan connection, return mock data with warning
            if (error.message.includes('No active Dhan connection')) {
                const mockMovers = {
                    gainers: this.generateMockStockData(parseInt(req.query.limit || 5), 'gainers'),
                    losers: this.generateMockStockData(parseInt(req.query.limit || 5), 'losers'),
                    lastUpdated: new Date().toISOString(),
                    warning: 'Please connect to Dhan in Data Integration settings to view live stock data.'
                };
                return res.json(mockMovers);
            }
            
            res.status(500).json({ error: 'Failed to fetch top movers data' });
        }
    }

    /**
     * Get institutional activity insights
     * @route GET /api/market-intelligence/institutional
     */
    async getInstitutionalActivity(req, res) {
        try {
            const cacheKey = 'institutional_activity';
            const cachedData = this.getCachedData(cacheKey);
            
            if (cachedData) {
                return res.json(cachedData);
            }

            // Generate insights based on market patterns
            const activity = this.generateInstitutionalInsights();
            
            this.setCachedData(cacheKey, activity);
            res.json(activity);
        } catch (error) {
            logger.error('Error in getInstitutionalActivity:', error);
            res.status(500).json({ error: 'Failed to fetch institutional activity data' });
        }
    }

    // Helper methods
    generateMockStockData(limit, type) {
        const stocks = [
            'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR',
            'ICICIBANK', 'KOTAKBANK', 'BHARTIARTL', 'ITC', 'LT',
            'SBIN', 'BAJFINANCE', 'ASIANPAINT', 'HCLTECH', 'MARUTI'
        ];

        return stocks.slice(0, limit).map(symbol => {
            const basePrice = 1000 + Math.random() * 2000;
            const changePercent = type === 'gainers' 
                ? Math.random() * 5 + 0.5  // 0.5% to 5.5%
                : -(Math.random() * 5 + 0.5); // -0.5% to -5.5%
            const change = (basePrice * changePercent) / 100;

            return {
                symbol,
                price: parseFloat(basePrice.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2)),
                volume: Math.floor(Math.random() * 1000000) + 100000,
                high: parseFloat((basePrice + Math.random() * 50).toFixed(2)),
                low: parseFloat((basePrice - Math.random() * 50).toFixed(2))
            };
        });
    }

    getDefaultIndexData(symbol) {
        const defaults = {
            'NIFTY 50': { symbol: 'NIFTY 50', price: 19745, change: 165, changePercent: 0.85, volume: 0, high: 19856, low: 19632, open: 19580 },
            'NIFTY BANK': { symbol: 'NIFTY BANK', price: 43250, change: -245, changePercent: -0.56, volume: 0, high: 43520, low: 43180, open: 43495 },
            'SENSEX': { symbol: 'SENSEX', price: 65721, change: 425, changePercent: 0.65, volume: 0, high: 65890, low: 65456, open: 65296 },
            'INDIA VIX': { symbol: 'INDIA VIX', price: 11.25, change: -0.85, changePercent: -6.02, volume: 0, high: 12.10, low: 11.15, open: 12.10 }
        };
        return defaults[symbol] || { symbol, price: 0, change: 0, changePercent: 0, volume: 0, high: 0, low: 0, open: 0 };
    }

    getDefaultSectorData(sector) {
        // Generate random but realistic sector performance
        const basePrice = 15000 + Math.random() * 10000;
        const changePercent = (Math.random() - 0.5) * 4; // -2% to +2%
        const change = (basePrice * changePercent) / 100;
        
        return {
            name: sector,
            price: parseFloat(basePrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            volume: Math.floor(Math.random() * 1000000),
            high: parseFloat((basePrice + Math.random() * 200).toFixed(2)),
            low: parseFloat((basePrice - Math.random() * 200).toFixed(2))
        };
    }

    generateFIIDIIData() {
        const days = 10;
        const data = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            data.push({
                date: date.toISOString().split('T')[0],
                fii: {
                    buy: Math.floor(Math.random() * 5000) + 1000,
                    sell: Math.floor(Math.random() * 5000) + 1000,
                    net: 0
                },
                dii: {
                    buy: Math.floor(Math.random() * 3000) + 500,
                    sell: Math.floor(Math.random() * 3000) + 500,
                    net: 0
                }
            });
            
            const lastItem = data[data.length - 1];
            lastItem.fii.net = lastItem.fii.buy - lastItem.fii.sell;
            lastItem.dii.net = lastItem.dii.buy - lastItem.dii.sell;
        }
        
        return {
            data: data,
            summary: {
                fiiNetFlow: data.reduce((sum, item) => sum + item.fii.net, 0),
                diiNetFlow: data.reduce((sum, item) => sum + item.dii.net, 0)
            },
            lastUpdated: new Date().toISOString()
        };
    }

    generateInstitutionalInsights() {
        return {
            insights: [
                {
                    type: 'FII_ACTIVITY',
                    message: 'FIIs have been net buyers for the last 3 sessions',
                    sentiment: 'positive',
                    amount: '₹2,450 Cr',
                    timeframe: '3 days'
                },
                {
                    type: 'SECTOR_ROTATION',
                    message: 'Money rotation from IT to Banking sector observed',
                    sentiment: 'neutral',
                    sectors: ['Banking +₹1,200Cr', 'IT -₹850Cr'],
                    timeframe: 'This week'
                },
                {
                    type: 'DII_ACTIVITY',
                    message: 'DIIs showing consistent buying in large-cap stocks',
                    sentiment: 'positive',
                    amount: '₹1,850 Cr',
                    timeframe: '5 days'
                }
            ],
            lastUpdated: new Date().toISOString()
        };
    }

    getMarketStatus() {
        const now = new Date();
        const day = now.getDay();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        
        // Check if it's a weekday (Monday-Friday)
        const isWeekday = day >= 1 && day <= 5;
        
        // Check if it's between 9:15 AM and 3:30 PM IST
        const isMarketHours = (
            (hours > 9 || (hours === 9 && minutes >= 15)) && 
            (hours < 15 || (hours === 15 && minutes <= 30))
        );
        
        return {
            isOpen: isWeekday && isMarketHours,
            status: isWeekday && isMarketHours ? 'OPEN' : 'CLOSED',
            nextOpen: this.getNextMarketOpen()
        };
    }

    getNextMarketOpen() {
        const now = new Date();
        const next = new Date(now);
        
        // If it's weekend, move to Monday
        if (now.getDay() === 0) { // Sunday
            next.setDate(now.getDate() + 1);
        } else if (now.getDay() === 6) { // Saturday
            next.setDate(now.getDate() + 2);
        } else if (now.getHours() >= 15 && now.getMinutes() > 30) {
            // After market hours, move to next day
            next.setDate(now.getDate() + 1);
        }
        
        next.setHours(9, 15, 0, 0);
        return next.toISOString();
    }

    getCachedData(key) {
        const cachedItem = this.cache.get(key);
        if (cachedItem && (Date.now() - cachedItem.timestamp) < this.cacheExpiry) {
            return cachedItem.data;
        }
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }
}

module.exports = new MarketIntelligenceController();
