const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const config = {
    app: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    db: {
        uri: process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/dhan_market_app',
        options: {
            // MongoDB Driver 4.0+ doesn't require these options anymore
        }
    },
    dhan: {
        accessToken: process.env.ACCESS_TOKEN,
        baseUrl: 'https://api.dhan.co',
        wsUrl: process.env.WEBSOCKET_URL || 'wss://dhan-api-url.com/websocket'
    },
    swagger: {
        url: process.env.SWAGGER_URL || '/api-docs'
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        directory: path.join(__dirname, '../logs')
    }
};

// Validate required configuration
const validateConfig = () => {
    const required = ['dhan.accessToken'];
    const missing = required.filter(key => {
        const value = key.split('.').reduce((obj, k) => obj && obj[k], config);
        return !value;
    });

    if (missing.length > 0) {
        throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
};

validateConfig();

module.exports = config;