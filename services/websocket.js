const WebSocket = require('ws');
const config = require('../config/config');
let { logger } = require('../utils/logger');
const { Tick } = require('../models/marketData');
const { getAccessToken, getClientId } = require('./tokenService');

if (!logger) {
    logger = {
        info: (...args) => console.info('[INFO]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
        warn: (...args) => console.warn('[WARN]', ...args),
    };
}

class WebSocketService {
    constructor() {
        if (WebSocketService.instance) {
            return WebSocketService.instance;
        }
        
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 5000;
        this.subscriptions = new Map(); // Initialize subscriptions Map
        
        WebSocketService.instance = this;
    }

    static getInstance() {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    buildWsUrl() {
        const params = new URLSearchParams({
            version: '2',
            token: process.env.ACCESS_TOKEN,
            clientId: process.env.CLIENT_ID,
            authType: '2'
        });
        return `wss://api-feed.dhan.co?${params.toString()}`;
    }

    connect() {
        try {
            const wsUrl = this.buildWsUrl();
            this.ws = new WebSocket(wsUrl);

            // Get client ID for logging but mask the access token
            const clientId = getClientId();
            logger.info('WebSocket connecting...', {
                url: wsUrl.replace(/token=[^&]+/, 'token=XXXXX'), // mask token in logs
                clientId: clientId
            });
            this.setupEventHandlers();
        } catch (error) {
            logger.error('WebSocket connection error:', error.message);
            this.handleReconnect();
        }
    }

    setupEventHandlers() {
        this.ws.on('open', () => {
            logger.info('WebSocket connected');
            this.reconnectAttempts = 0;
            this.resubscribeAll(); // Resubscribe to all feeds after reconnect
        });

        this.ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                logger.debug('Received message:', message);
                this.handleMessage(message);
            } catch (error) {
                logger.error('Error processing message:', error.message);
            }
        });

        this.ws.on('error', (error) => {
            logger.error('WebSocket error:', error.message);
        });

        this.ws.on('close', () => {
            logger.info('WebSocket connection closed');
            this.handleReconnect();
        });
    }

    subscribe(symbol, callback) {
        this.subscriptions.set(symbol, callback);
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.sendSubscribeMessage([symbol]);
        }
    }

    unsubscribe(symbol) {
        this.subscriptions.delete(symbol);
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.sendUnsubscribeMessage([symbol]);
        }
    }

    resubscribeAll() {
        const symbols = Array.from(this.subscriptions.keys());
        if (symbols.length > 0) {
            this.sendSubscribeMessage(symbols);
        }
    }

    sendSubscribeMessage(symbols) {
        const message = {
            action: 'subscribe',
            key: ['feed'],
            value: symbols
        };
        this.ws.send(JSON.stringify(message));
        logger.info('Sent subscribe message:', message);
    }

    sendUnsubscribeMessage(symbols) {
        const message = {
            action: 'unsubscribe',
            key: ['feed'],
            value: symbols
        };
        this.ws.send(JSON.stringify(message));
        logger.info('Sent unsubscribe message:', message);
    }

    handleMessage(message) {
        const callback = this.subscriptions.get(message.symbol);
        if (callback) {
            callback(message);
        }
    }

    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.subscriptions.clear();
        }
    }
}

module.exports = WebSocketService;