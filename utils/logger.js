const winston = require('winston');
const path = require('path');
const config = require('../config/config');

// Define custom log format
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    transports: [
        // Console transport for development
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // File transport for errors
        new winston.transports.File({
            filename: path.join(config.logging.directory, 'error.log'),
            level: 'error'
        }),
        // File transport for all logs
        new winston.transports.File({
            filename: path.join(config.logging.directory, 'combined.log')
        })
    ]
});

// Add request logging middleware
logger.requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP Request', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('user-agent'),
            ip: req.ip
        });
    });
    next();
};

// Add WebSocket logging middleware
const wsLogger = (event, data) => {
    logger.info('WebSocket Event', {
        event,
        data,
        timestamp: new Date().toISOString()
    });
};

// Add the wsLogger to the logger object
logger.wsLogger = wsLogger;

// Export the enhanced logger
module.exports = logger;