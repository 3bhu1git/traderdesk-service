const express = require('express');
const router = express.Router();
const { validateApiKey, validateToken, rateLimiter } = require('../middleware/security');
const marketDataController = require('../controllers/marketDataController');
const orderController = require('../controllers/orderController');
const portfolioController = require('../controllers/portfolioController');
const marketIntelligenceRoutes = require('./marketIntelligence');

// Apply security middleware to all routes
router.use(validateApiKey);
router.use(validateToken);
router.use(rateLimiter);

// Market Intelligence Routes
router.use('/market-intelligence', marketIntelligenceRoutes);

// Market Data Routes
router.get('/live-price/:symbol', marketDataController.getLivePrice);
router.get('/historical-data/:symbol', marketDataController.getHistoricalData);
router.get('/backtest/:symbol', marketDataController.getBacktestData);
router.get('/symbols', marketDataController.getSupportedSymbols);

// Order Management Routes
router.post('/place-order', orderController.placeOrder);
router.put('/modify-order/:orderId', orderController.modifyOrder);
router.delete('/cancel-order/:orderId', orderController.cancelOrder);
router.get('/order-status/:orderId', orderController.getOrderStatus);
router.get('/orders', orderController.getOrderHistory);

// Portfolio Routes
router.get('/holdings', portfolioController.getHoldings);
router.get('/positions', portfolioController.getPositions);
router.get('/portfolio/summary', portfolioController.getPortfolioSummary);
router.get('/portfolio/symbol/:symbol', portfolioController.getSymbolDetails);

module.exports = router;