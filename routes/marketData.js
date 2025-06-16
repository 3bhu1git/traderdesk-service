const express = require('express');
const router = express.Router();
const marketDataController = require('../controllers/marketDataController');
const marketFeedController = require('../controllers/marketFeedController');

// Subscribe to live market data for a specific symbol
router.get('/:symbol', marketDataController.subscribeToLiveData);

// Fetch historical OHLC data for a specific symbol
router.get('/:symbol/historical', marketDataController.fetchHistoricalData);

// Live index feeds
router.get('/live/:index', (req, res) => marketFeedController.subscribeLiveIndex(req, res));

module.exports = router;