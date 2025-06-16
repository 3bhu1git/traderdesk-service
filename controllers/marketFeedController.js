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

    subscribeLiveIndex(req, res) {
        const { index } = req.params;
        const indexCode = this.indexMap[index.toLowerCase()];

        if (!indexCode) {
            return res.status(400).json({ error: 'Invalid index specified' });
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        this.wsService.subscribe(indexCode, (data) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        });

        req.on('close', () => {
            logger.info(`Client disconnected from ${index} feed`);
        });
    }
}

module.exports = new MarketFeedController();
