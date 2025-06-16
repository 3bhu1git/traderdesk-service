const axios = require('axios');
const config = require('../config/config');
const { logger } = require('../utils/logger');
const { OHLC } = require('../models/marketData');
const wsService = require('./websocket');

class MarketDataService {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: config.dhan.baseUrl,
            headers: {
                'Authorization': `Bearer ${config.dhan.accessToken}`,
                'X-Api-Key': config.dhan.apiKey,
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
            const response = await this.axiosInstance.get('/historical-data', {
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
            const response = await this.axiosInstance.get('/quote', {
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
            const response = await this.axiosInstance.get('/instruments');
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