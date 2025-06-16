const express = require('express');
const router = express.Router();
const marketDataController = require('../controllers/marketDataController');

// Subscribe to live market data for a specific symbol
router.get('/:symbol', marketDataController.subscribeToLiveData);

// Fetch historical OHLC data for a specific symbol
router.get('/:symbol/historical', marketDataController.fetchHistoricalData);

module.exports = router;