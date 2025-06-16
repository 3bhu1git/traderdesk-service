const portfolioService = require('../services/portfolio');
let { logger } = require('../utils/logger');

// Fallback logger if logger is undefined
if (!logger) {
    logger = {
        info: (...args) => console.info('[INFO]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
        warn: (...args) => console.warn('[WARN]', ...args),
        debug: (...args) => console.debug('[DEBUG]', ...args)
    };
}

class PortfolioController {
    /**
     * Get user holdings
     * @route GET /portfolio/holdings
     */
    async getHoldings(req, res) {
        try {
            const holdings = await portfolioService.getHoldings();
            
            if (!holdings) {
                throw new Error('No holdings data received');
            }

            logger.info('Holdings fetched successfully');
            res.json(holdings);
        } catch (error) {
            const errorMessage = error.message || 'Internal server error';
            logger.error('Error fetching holdings:', errorMessage);
            res.status(500).json({ error: errorMessage });
        }
    }

    /**
     * Get user positions
     * @route GET /positions
     */
    async getPositions(req, res) {
        try {
            const positions = await portfolioService.getPositions();
            
            if (!positions) {
                throw new Error('No positions data received');
            }

            logger.info('Positions fetched successfully');
            res.json(positions);
        } catch (error) {
            const errorMessage = error.message || 'Internal server error';
            logger.error('Error fetching positions:', errorMessage);
            res.status(500).json({ error: errorMessage });
        }
    }

    /**
     * Get portfolio summary
     * @route GET /portfolio/summary
     */
    async getPortfolioSummary(req, res) {
        try {
            const summary = await portfolioService.getPortfolioSummary();
            
            if (!summary) {
                throw new Error('No summary data received');
            }

            logger.info('Portfolio summary fetched successfully');
            res.json(summary);
        } catch (error) {
            const errorMessage = error.message || 'Internal server error';
            logger.error('Error fetching portfolio summary:', errorMessage);
            res.status(500).json({ error: errorMessage });
        }
    }

    /**
     * Get combined position and holding for a symbol
     * @route GET /portfolio/symbol/:symbol
     */
    async getSymbolDetails(req, res) {
        try {
            const { symbol } = req.params;
            const details = await portfolioService.getSymbolPositionAndHolding(symbol);
            
            if (!details) {
                throw new Error('No symbol details received');
            }

            logger.info('Symbol details fetched successfully');
            res.json(details);
        } catch (error) {
            const errorMessage = error.message || 'Internal server error';
            logger.error('Error fetching symbol details:', errorMessage);
            res.status(500).json({ error: errorMessage });
        }
    }
}

module.exports = new PortfolioController();