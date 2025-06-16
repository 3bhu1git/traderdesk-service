const axios = require('axios');
let { logger } = require('../utils/logger');

// Fallback logger
if (!logger) {
    logger = {
        info: (...args) => console.info('[INFO]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
        warn: (...args) => console.warn('[WARN]', ...args),
    };
}

class PortfolioService {
    constructor() {
        if (!process.env.CLIENT_ID || !process.env.ACCESS_TOKEN) {
            throw new Error('CLIENT_ID and ACCESS_TOKEN must be set in .env file');
        }

        this.baseUrl = 'https://api.dhan.co/v2'; // Add /v2
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 10000,
            headers: {
                'access-token': process.env.ACCESS_TOKEN,
                'client-id': process.env.CLIENT_ID,
                'Content-Type': 'application/json'
            }
        });

        // Log configuration
        logger.info('Portfolio service initialized with credentials', {
            clientId: process.env.CLIENT_ID,
            baseUrl: this.baseUrl
        });
    }

    async getHoldings() {
        try {
            const response = await this.client.get('/holdings');
            return response.data;
        } catch (error) {
            logger.error('Holdings API error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    async getPositions() {
        try {
            const response = await this.client.get('/positions');
            return response.data;
        } catch (error) {
            logger.error('Positions API error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw new Error(error.response?.data?.message || error.message);
        }
    }
}

module.exports = new PortfolioService();