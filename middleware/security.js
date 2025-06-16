const rateLimit = require('express-rate-limit');
const config = require('../config/config');
let { logger } = require('../utils/logger');

// Fallback logger if logger is undefined
if (!logger) {
    logger = {
        warn: (...args) => console.warn('[WARN]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
        info: (...args) => console.info('[INFO]', ...args),
    };
}

// Rate limiting middleware
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path
        });
        res.status(429).json({
            error: 'Too many requests, please try again later'
        });
    }
});

// API key validation middleware
const validateApiKey = (req, res, next) => {
    // Skip API key validation for portfolio routes
    if (req.path.startsWith('/portfolio/') || req.baseUrl.includes('/portfolio')) {
        return next();
    }

    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== config.dhan.apiKey) {
        logger.warn('Invalid API key attempt', {
            ip: req.ip,
            path: req.path
        });
        return res.status(401).json({
            error: 'Invalid API key'
        });
    }
    next();
};

const validateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Allow using ACCESS_TOKEN from .env if no Authorization header is present
    if (!authHeader && process.env.ACCESS_TOKEN) {
        req.headers.authorization = `Bearer ${process.env.ACCESS_TOKEN}`;
    }

    const finalAuthHeader = req.headers.authorization;

    if (!finalAuthHeader || !finalAuthHeader.startsWith('Bearer ')) {
        logger.warn('Missing or invalid bearer token', {
            ip: req.ip,
            path: req.path
        });
        return res.status(401).json({
            error: 'Authorization token required'
        });
    }

    const token = finalAuthHeader.split(' ')[1];
    if (token !== config.dhan.accessToken && token !== process.env.ACCESS_TOKEN) {
        logger.warn('Invalid bearer token attempt', {
            ip: req.ip,
            path: req.path
        });
        return res.status(401).json({
            error: 'Invalid authorization token'
        });
    }

    next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred' 
            : err.message
    });
};

module.exports = {
    rateLimiter,
    validateApiKey,
    validateToken,
    errorHandler
};