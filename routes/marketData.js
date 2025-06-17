const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const HistoricalData = require('../models/HistoricalData');
const logger = require('../utils/logger');

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

// Create rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: 15 * 60 // 15 minutes in seconds
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', { 
            ip: req.ip, 
            path: req.path 
        });
        res.status(429).json({
            error: 'Too many requests, please try again later.',
            retryAfter: 15 * 60
        });
    }
});

// Apply rate limiting to all routes
router.use(apiLimiter);

/**
 * @swagger
 * /api/market/historical-data:
 *   post:
 *     summary: Save historical market data
 *     tags: [Market Data]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symbol:
 *                 type: string
 *               candles:
 *                 type: array
 *                 items:
 *                   type: object
 */
router.post('/historical-data', async (req, res) => {
    try {
        const { symbol, candles } = req.body;
        
        if (!symbol || !candles || !Array.isArray(candles)) {
            return res.status(400).json({ error: 'Invalid request body' });
        }
        
        // Delete existing data for the symbol
        await HistoricalData.deleteMany({ symbol });
        
        // Insert new data
        const dataToInsert = candles.map(candle => ({
            symbol,
            timestamp: new Date(candle.timestamp),
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume,
            createdAt: new Date()
        }));
        
        await HistoricalData.insertMany(dataToInsert);
        
        // Clear cache for this symbol
        for (const key of cache.keys()) {
            if (key.startsWith(`${symbol}-`)) {
                cache.delete(key);
            }
        }
        
        logger.info(`Saved ${candles.length} candles for ${symbol}`);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error saving historical data:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/market/historical-data:
 *   get:
 *     summary: Get historical market data
 *     tags: [Market Data]
 *     parameters:
 *       - in: query
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 */
router.get('/historical-data', async (req, res) => {
    try {
        const { symbol, from, to } = req.query;
        
        if (!symbol || !from || !to) {
            return res.status(400).json({ error: 'Missing required parameters: symbol, from, to' });
        }
        
        const cacheKey = `${symbol}-${from}-${to}`;
        
        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
            logger.info(`Returning cached data for ${symbol}`);
            return res.json(cachedData.data);
        }
        
        const data = await HistoricalData.find({
            symbol,
            timestamp: {
                $gte: new Date(from),
                $lte: new Date(to)
            }
        })
        .select('symbol timestamp open high low close volume')
        .sort({ timestamp: 1 });
        
        // Transform data for frontend
        const transformedData = data.map(doc => ({
            symbol: doc.symbol,
            timestamp: doc.timestamp.toISOString(),
            open: doc.open,
            high: doc.high,
            low: doc.low,
            close: doc.close,
            volume: doc.volume
        }));
        
        // Cache the result
        cache.set(cacheKey, {
            data: transformedData,
            timestamp: Date.now()
        });
        
        res.json(transformedData);
    } catch (error) {
        logger.error('Error getting historical data:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/market/historical-data/{symbol}:
 *   delete:
 *     summary: Clear historical market data for a symbol
 *     tags: [Market Data]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/historical-data/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        await HistoricalData.deleteMany({ symbol });
        
        // Clear cache for this symbol
        for (const key of cache.keys()) {
            if (key.startsWith(`${symbol}-`)) {
                cache.delete(key);
            }
        }
        
        logger.info(`Cleared historical data for ${symbol}`);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error clearing historical data:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 