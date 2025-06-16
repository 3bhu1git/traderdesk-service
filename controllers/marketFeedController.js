const WebSocketService = require('../services/websocket');
let { logger } = require('../utils/logger');

if (!logger) {
    logger = {
        info: (...args) => console.info('[INFO]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
        warn: (...args) => console.warn('[WARN]', ...args),
    };
}

class MarketFeedController {
    constructor() {
        this.wsService = WebSocketService.getInstance();
        this.indexMap = {
            'nifty': 'NSE_INDEX|Nifty 50',
            'banknifty': 'NSE_INDEX|Nifty Bank',
            'finnifty': 'NSE_INDEX|Nifty Fin Service',
            'sensex': 'BSE_INDEX|SENSEX',
            'midcap': 'NSE_INDEX|Nifty Midcap 100'
        };
    }

    async subscribeLiveIndex(req, res) {
        try {
            const { index } = req.params;
            const indexCode = this.indexMap[index.toLowerCase()];
            
            if (!indexCode) {
                throw new Error('Invalid index specified');
            }

            // Set headers for SSE
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

            // Create callback for index updates
            const callback = (data) => {
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            };

            // Subscribe to index
            this.wsService.subscribe(indexCode, callback);

            // Handle client disconnect
            req.on('close', () => {
                this.wsService.unsubscribe(indexCode, callback);
                logger.info(`Client disconnected from ${index} feed`);
            });

        } catch (error) {
            logger.error(`Error in live ${req.params.index} feed:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new MarketFeedController();
