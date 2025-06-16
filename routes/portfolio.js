const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { skipApiKeyValidation } = require('../middleware/portfolioMiddleware');

// Apply skip validation middleware to all portfolio routes
router.use(skipApiKeyValidation);

router.get('/holdings', (req, res) => portfolioController.getHoldings(req, res));
router.get('/positions', (req, res) => portfolioController.getPositions(req, res));
router.get('/summary', (req, res) => portfolioController.getPortfolioSummary(req, res));
router.get('/symbol/:symbol', (req, res) => portfolioController.getSymbolDetails(req, res));

module.exports = router;