const express = require('express');
const router = express.Router();
const marketIntelligenceController = require('../controllers/marketIntelligenceController');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/auth');

// Create rate limiter for market intelligence endpoints
const marketIntelligenceLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per minute
    message: {
        error: 'Too many market intelligence requests, please try again later.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(marketIntelligenceLimiter);

/**
 * @swagger
 * /api/market-intelligence/overview:
 *   get:
 *     summary: Get market overview including major indices
 *     tags: [Market Intelligence]
 *     responses:
 *       200:
 *         description: Market overview data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 indices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbol:
 *                         type: string
 *                       value:
 *                         type: number
 *                       change:
 *                         type: number
 *                       changePercent:
 *                         type: number
 *                 marketStatus:
 *                   type: object
 *                   properties:
 *                     isOpen:
 *                       type: boolean
 *                     status:
 *                       type: string
 *                 lastUpdated:
 *                   type: string
 */
router.get('/overview', marketIntelligenceController.getMarketOverview);

/**
 * @swagger
 * /api/market-intelligence/sectors:
 *   get:
 *     summary: Get sector performance data
 *     tags: [Market Intelligence]
 *     responses:
 *       200:
 *         description: Sector performance data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sectors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       value:
 *                         type: number
 *                       change:
 *                         type: number
 *                       changePercent:
 *                         type: number
 *                 lastUpdated:
 *                   type: string
 */
router.get('/sectors', marketIntelligenceController.getSectorPerformance);

/**
 * @swagger
 * /api/market-intelligence/fii-dii:
 *   get:
 *     summary: Get FII/DII activity data
 *     tags: [Market Intelligence]
 *     responses:
 *       200:
 *         description: FII/DII activity data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       fii:
 *                         type: object
 *                         properties:
 *                           buy:
 *                             type: number
 *                           sell:
 *                             type: number
 *                           net:
 *                             type: number
 *                       dii:
 *                         type: object
 *                         properties:
 *                           buy:
 *                             type: number
 *                           sell:
 *                             type: number
 *                           net:
 *                             type: number
 *                 summary:
 *                   type: object
 *                   properties:
 *                     fiiNetFlow:
 *                       type: number
 *                     diiNetFlow:
 *                       type: number
 *                 lastUpdated:
 *                   type: string
 */
router.get('/fii-dii', marketIntelligenceController.getFIIDIIActivity);

/**
 * @swagger
 * /api/market-intelligence/movers:
 *   get:
 *     summary: Get top gainers and losers
 *     tags: [Market Intelligence]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of top movers to return
 *     responses:
 *       200:
 *         description: Top movers data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gainers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbol:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       change:
 *                         type: number
 *                       changePercent:
 *                         type: number
 *                       volume:
 *                         type: number
 *                 losers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbol:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       change:
 *                         type: number
 *                       changePercent:
 *                         type: number
 *                       volume:
 *                         type: number
 *                 lastUpdated:
 *                   type: string
 */
router.get('/movers', marketIntelligenceController.getTopMovers);

/**
 * @swagger
 * /api/market-intelligence/institutional:
 *   get:
 *     summary: Get institutional activity insights
 *     tags: [Market Intelligence]
 *     responses:
 *       200:
 *         description: Institutional activity insights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 insights:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       message:
 *                         type: string
 *                       sentiment:
 *                         type: string
 *                       amount:
 *                         type: string
 *                       timeframe:
 *                         type: string
 *                 lastUpdated:
 *                   type: string
 */
router.get('/institutional', marketIntelligenceController.getInstitutionalActivity);

module.exports = router;
