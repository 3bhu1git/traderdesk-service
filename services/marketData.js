const axios = require('axios');
let { logger } = require('../utils/logger');

class MarketDataService {
    constructor() {
        if (!process.env.CLIENT_ID || !process.env.ACCESS_TOKEN) {
            throw new Error('CLIENT_ID and ACCESS_TOKEN must be set in .env');
        }

        this.baseUrl = 'https://api.dhan.co';
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 10000,
            headers: {
                'access-token': process.env.ACCESS_TOKEN,
                'client-id': process.env.CLIENT_ID,
                'Content-Type': 'application/json'
            }
        });
    }

    async fetchHistoricalData(symbol, timeframe, fromDate, toDate) {
        try {
            // Check if data exists in database
            const existingData = await OHLC.findBySymbolAndTimeRange(
                symbol,
                timeframe,
                new Date(fromDate),
                new Date(toDate)
            );

            // If we have complete data, return it
            if (existingData.length > 0) {
                logger.info('Returning historical data from database', {
                    symbol,
                    timeframe,
                    count: existingData.length
                });
                return existingData;
            }

            // Fetch from Dhan API
            const response = await this.client.get('/historical-data', {
                params: {
                    symbol,
                    timeframe,
                    from_date: fromDate,
                    to_date: toDate
                }
            });

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Invalid response format from Dhan API');
            }

            // Transform and store data
            const ohlcData = response.data.map(candle => ({
                symbol,
                exchange: 'NSE', // Default to NSE, modify as needed
                timeframe,
                timestamp: new Date(candle.timestamp),
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume
            }));

            // Store in database
            await OHLC.insertMany(ohlcData, { ordered: false });

            logger.info('Historical data fetched and stored', {
                symbol,
                timeframe,
                count: ohlcData.length
            });

            return ohlcData;

        } catch (error) {
            logger.error('Error fetching historical data', {
                symbol,
                timeframe,
                error: error.message
            });
            throw error;
        }
    }

    async getLivePrice(symbol) {
        try {
            // Subscribe to WebSocket feed
            wsService.subscribe(symbol);

            // Also fetch current price through REST API
            const response = await this.client.get('/quote', {
                params: { symbol }
            });

            return response.data;

        } catch (error) {
            logger.error('Error fetching live price', {
                symbol,
                error: error.message
            });
            throw error;
        }
    }

    // Method to setup SSE for live price updates
    setupLivePriceStream(symbol, response) {
        try {
            // Set headers for SSE
            response.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

            // Add client to WebSocket service
            wsService.addClient(symbol, response);

            logger.info('Live price stream setup', { symbol });

        } catch (error) {
            logger.error('Error setting up live price stream', {
                symbol,
                error: error.message
            });
            throw error;
        }
    }

    // Method to format OHLC data for charting
    formatChartData(ohlcData) {
        return ohlcData.map(candle => ({
            time: candle.timestamp.getTime(),
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume
        }));
    }

    // Method to get supported symbols
    async getSupportedSymbols() {
        try {
            const response = await this.client.get('/instruments');
            return response.data;
        } catch (error) {
            logger.error('Error fetching supported symbols', {
                error: error.message
            });
            throw error;
        }
    }
}

// Create singleton instance
const marketDataService = new MarketDataService();

module.exports = marketDataService;