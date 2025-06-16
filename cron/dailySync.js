const cron = require('node-cron');
const mongoose = require('mongoose');
const { fetchHistoricalData } = require('../services/dhanApiService');
const Tick = require('../models/tick');
const Ohlc = require('../models/ohlc');

const keySymbols = ['NIFTY', 'RELIANCE', 'INFY'];

const dailySync = async () => {
    try {
        for (const symbol of keySymbols) {
            const historicalData = await fetchHistoricalData(symbol);
            if (historicalData) {
                await Ohlc.updateOne(
                    { symbol: symbol },
                    { $set: { data: historicalData } },
                    { upsert: true }
                );
                console.log(`Historical data for ${symbol} synced successfully.`);
            }
        }
    } catch (error) {
        console.error('Error during daily sync:', error);
    }
};

// Schedule the job to run at the end of each day
cron.schedule('0 0 * * *', dailySync);

module.exports = dailySync;