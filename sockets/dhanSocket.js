const WebSocket = require('ws');
const { getAccessToken } = require('../services/tokenService');
const { logger } = require('../utils/logger');

const DhanSocket = {
    ws: null,
    symbol: null,
    isConnected: false,

    connect(symbol) {
        this.symbol = symbol;
        const accessToken = getAccessToken();

        this.ws = new WebSocket(`wss://api.dhan.co.in/v1/marketdata?symbol=${this.symbol}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        this.ws.on('open', () => {
            this.isConnected = true;
            logger.info(`WebSocket connected for symbol: ${this.symbol}`);
        });

        this.ws.on('message', (data) => {
            this.handleMessage(data);
        });

        this.ws.on('close', () => {
            this.isConnected = false;
            logger.warn(`WebSocket disconnected for symbol: ${this.symbol}`);
            // Optionally implement reconnection logic here
        });

        this.ws.on('error', (error) => {
            logger.error(`WebSocket error: ${error.message}`);
        });
    },

    handleMessage(data) {
        // Process incoming data and stream it to clients
        logger.info(`Received data for ${this.symbol}: ${data}`);
        // Implement SSE or WebSocket proxy logic to send data to clients
    },

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.isConnected = false;
            logger.info(`WebSocket disconnected for symbol: ${this.symbol}`);
        }
    }
};

module.exports = DhanSocket;