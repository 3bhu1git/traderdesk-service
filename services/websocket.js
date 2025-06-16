const WebSocket = require('ws');
const config = require('../config/config');
let { logger } = require('../utils/logger');
const { Tick } = require('../models/marketData');

// Fallback logger
if (!logger) {
    logger = {
        info: (...args) => console.info('[INFO]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
        warn: (...args) => console.warn('[WARN]', ...args),
    };
}

class WebSocketService {
    static instance = null;

    static getInstance() {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }
    constructor() {
        this.wsUrl = process.env.WEBSOCKET_URL || 'wss://api.dhan.co/v2/ws';
        this.headers = {
            'Dhan-Client-Id': process.env.CLIENT_ID,
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
        };

        this.ws = null;
        this.subscriptions = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 5000; // 5 seconds
        this.heartbeatInterval = null;
        this.clients = new Map(); // Store connected clients for SSE
    }

    connect() {
        if (!process.env.CLIENT_ID || !process.env.ACCESS_TOKEN) {
            logger.error('Missing required credentials in .env');
            return;
        }

        try {
            this.ws = new WebSocket(this.wsUrl, {
                headers: this.headers
            });

            this.setupEventHandlers();
            this.startHeartbeat();
        } catch (error) {
            logger.error('connection_error', error.message);
            this.handleReconnect();
        }
    }

    setupEventHandlers() {
        this.ws.on('open', () => {
            logger.info('connection_open', 'WebSocket connection established');
            this.reconnectAttempts = 0;
            this.resubscribeAll();
        });

        this.ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data);
                await this.handleMessage(message);
            } catch (error) {
                logger.error('message_error', error.message);
            }
        });

        this.ws.on('close', () => {
            logger.info('connection_close', 'WebSocket connection closed');
            this.handleReconnect();
        });

        this.ws.on('error', (error) => {
            logger.error('connection_error', error.message);
            this.handleReconnect();
        });
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'heartbeat' }));
            }
        }, 30000); // 30 seconds
    }

    async handleMessage(message) {
        logger.info('message_received', message);

        // Store tick data in MongoDB
        if (message.type === 'tick') {
            try {
                const tick = new Tick({
                    symbol: message.symbol,
                    exchange: message.exchange,
                    timestamp: new Date(message.timestamp),
                    lastPrice: message.lastPrice,
                    lastQuantity: message.lastQuantity,
                    volume: message.volume,
                    bidPrice: message.bidPrice,
                    bidQuantity: message.bidQuantity,
                    askPrice: message.askPrice,
                    askQuantity: message.askQuantity,
                    openInterest: message.openInterest
                });

                await tick.save();

                // Broadcast to subscribed clients
                this.broadcastToClients(message.symbol, message);
            } catch (error) {
                logger.error('tick_save_error', error.message);
            }
        }
    }

    handleReconnect() {
        clearInterval(this.heartbeatInterval);

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            logger.info('reconnect_attempt', `Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay);
        } else {
            logger.warn('reconnect_failed', 'Max reconnection attempts reached');
        }
    }

    subscribe(symbol) {
        if (this.ws.readyState === WebSocket.OPEN) {
            const subscribeMessage = {
                type: 'subscribe',
                symbol: symbol
            };
            this.ws.send(JSON.stringify(subscribeMessage));
            this.subscriptions.set(symbol, true);
            logger.info('subscribe', { symbol });
        }
    }

    unsubscribe(symbol) {
        if (this.ws.readyState === WebSocket.OPEN) {
            const unsubscribeMessage = {
                type: 'unsubscribe',
                symbol: symbol
            };
            this.ws.send(JSON.stringify(unsubscribeMessage));
            this.subscriptions.delete(symbol);
            logger.info('unsubscribe', { symbol });
        }
    }

    resubscribeAll() {
        for (const symbol of this.subscriptions.keys()) {
            this.subscribe(symbol);
        }
    }

    // SSE client management
    addClient(symbol, response) {
        if (!this.clients.has(symbol)) {
            this.clients.set(symbol, new Set());
        }
        this.clients.get(symbol).add(response);

        // Subscribe to symbol if not already subscribed
        if (!this.subscriptions.has(symbol)) {
            this.subscribe(symbol);
        }

        response.on('close', () => {
            this.removeClient(symbol, response);
        });
    }

    removeClient(symbol, response) {
        if (this.clients.has(symbol)) {
            this.clients.get(symbol).delete(response);

            // If no more clients for this symbol, unsubscribe
            if (this.clients.get(symbol).size === 0) {
                this.clients.delete(symbol);
                this.unsubscribe(symbol);
            }
        }
    }

    broadcastToClients(symbol, data) {
        if (this.clients.has(symbol)) {
            const clients = this.clients.get(symbol);
            clients.forEach(client => {
                client.write(`data: ${JSON.stringify(data)}\n\n`);
            });
        }
    }

    close() {
        if (this.ws) {
            clearInterval(this.heartbeatInterval);
            this.ws.close();
        }
    }
}

// Export the WebSocketService class
module.exports = WebSocketService;