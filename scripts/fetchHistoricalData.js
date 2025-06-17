require('dotenv').config();
const axios = require('axios');
const axiosRetry = require('axios-retry').default; // Fixed import
const mongoose = require('mongoose'); // Required for DB operations
const connectDB = require('../config/database');
const HistoricalData = require('../models/HistoricalData');
const logger = require('../utils/logger');

// Dhan API configuration
const DHAN_API_BASE_URL = process.env.BASE_URL || 'https://api.dhan.co/v2';
const DHAN_ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// MongoDB connection URI
const MONGODB_URI = 'mongodb://localhost:27017/traderdesk';

async function fetchHistoricalData() {
  try {
    const securityId = '1333'; // NIFTY 50 index

    if (!DHAN_ACCESS_TOKEN || DHAN_ACCESS_TOKEN === 'your_dhan_access_token_here') {
      logger.error('DHAN_ACCESS_TOKEN is not configured in environment variables');
      throw new Error('API credentials not configured');
    }

    // Date range: last 30 days
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);

    const formattedFromDate = fromDate.toISOString().split('T')[0];
    const formattedToDate = toDate.toISOString().split('T')[0];

    logger.info(`Fetching historical data for NIFTY from ${formattedFromDate} to ${formattedToDate}`);

    // Axios retry config
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) =>
        axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429,
    });

    const response = await axiosInstance.post(
      `${DHAN_API_BASE_URL}/charts/historical`,
      {
        securityId,
        exchangeSegment: 'NSE_EQ',
        instrument: 'INDEX',
        expiryCode: 0,
        oi: false,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'access-token': DHAN_ACCESS_TOKEN,
        },
        timeout: 10000,
      }
    );

    const requiredFields = ['open', 'high', 'low', 'close', 'volume', 'timestamp'];
    if (!requiredFields.every((field) => response.data[field])) {
      throw new Error('Invalid API response structure');
    }

    const { open, high, low, close, volume, timestamp } = response.data;

    const candles = timestamp.map((time, index) => ({
      symbol: 'NIFTY',
      timestamp: new Date(time * 1000),
      open: open[index],
      high: high[index],
      low: low[index],
      close: close[index],
      volume: volume[index],
      createdAt: new Date(),
    }));

    // Delete old data
    const deleteResult = await HistoricalData.deleteMany({ symbol: 'NIFTY' });
    logger.info(`Cleared ${deleteResult.deletedCount} existing records`);

    // Validate each document
    candles.forEach((candle) => {
      const validationError = new HistoricalData(candle).validateSync();
      if (validationError) {
        throw new Error(`Data validation failed: ${validationError.message}`);
      }
    });

    // Insert new candles
    const insertResult = await HistoricalData.insertMany(candles);
    logger.info(`Inserted ${insertResult.length} new records`);
    logger.info(`Successfully saved ${candles.length} candles for NIFTY`);

    return candles;
  } catch (error) {
    logger.error('Error fetching historical data:', error.response?.data || error.message);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  async function main() {
    try {
      await connectDB();
      await fetchHistoricalData();
      logger.info('Historical data fetch completed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Script execution failed:', error);
      process.exit(1);
    }
  }

  main();
}

module.exports = {
  fetchHistoricalData,
};
