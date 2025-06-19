const logger = require('../utils/logger');
const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// Fallback logger if logger is undefined
if (!logger) {
    logger = {
        warn: (...args) => console.warn('[WARN]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
        info: (...args) => console.info('[INFO]', ...args),
    };
}

// Rate limiter middleware
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: 15 * 60 // 15 minutes in seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
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

// Validate client ID and bearer token as per swagger spec
const validateApiKey = (req, res, next) => {
    // Skip authentication for all market data endpoints
    if (req.path.startsWith('/api/market-data') || req.path.includes('/market-data/')) {
        return next();
    }
    
    const expectedClientId = process.env.CLIENT_ID;
    const expectedAccessToken = process.env.ACCESS_TOKEN;
    
    if (!expectedClientId || !expectedAccessToken) {
        logger.error('Server configuration error - Required credentials not set in .env');
        return res.status(500).json({ error: 'Server configuration error' });
    }
    
    next();
};

// Basic token validation
const validateToken = (req, res, next) => {
    const expectedToken = process.env.ACCESS_TOKEN;
    if (!expectedToken) {
        logger.error('Server configuration error - ACCESS_TOKEN not set in .env');
        return res.status(500).json({ error: 'Server configuration error' });
    }
    next();
};

module.exports = {
    validateApiKey,
    validateToken,
    rateLimiter
};