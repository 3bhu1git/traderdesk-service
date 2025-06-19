const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { validateApiKey } = require('../middleware/portfolioMiddleware');

// Apply validation middleware to all portfolio routes
router.use(validateApiKey);

router.get('/holdings', (req, res) => portfolioController.getHoldings(req, res));
router.get('/positions', (req, res) => portfolioController.getPositions(req, res));
router.get('/summary', (req, res) => portfolioController.getPortfolioSummary(req, res));
router.get('/symbol/:symbol', (req, res) => portfolioController.getSymbolDetails(req, res));

module.exports = router;