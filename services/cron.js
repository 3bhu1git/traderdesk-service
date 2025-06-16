const cron = require('node-cron');
let { logger } = require('../utils/logger');

// Fallback logger if logger is undefined
if (!logger) {
    logger = {
        info: (...args) => console.info('[INFO]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
        warn: (...args) => console.warn('[WARN]', ...args),
    };
}

const marketDataService = require('./marketData');
const portfolioService = require('./portfolio');

class CronService {
    static instance = null;

    static getInstance() {
        if (!CronService.instance) {
            CronService.instance = new CronService();
        }
        return CronService.instance;
    }

    constructor() {
        if (CronService.instance) {
            return CronService.instance;
        }
        // Validate required environment variables
        if (!process.env.CLIENT_ID || !process.env.ACCESS_TOKEN) {
            throw new Error('Missing required credentials in .env');
        }
        
        this.headers = {
            'Dhan-Client-Id': process.env.CLIENT_ID,
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
        };
        this.jobs = new Map();
        this.keySymbols = ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'INFY', 'TCS'];
        this.timeframes = ['1d', '1h', '15m'];
        this.isRunning = false;
        CronService.instance = this;
    }

    start() {
        try {
            logger.info('Starting cron service with credentials from .env');
            this.setupDailyDataSync();
            this.setupPortfolioSync();
            this.setupTokenRefresh();
            logger.info('Cron service started');
        } catch (error) {
            logger.error('Failed to start cron service:', error);
        }
    }

    stop() {
        logger.info('Stopping cron service');
        this.isRunning = false;
        
        // Clear all jobs
        for (const [name, job] of this.jobs.entries()) {
            clearInterval(job);
            this.jobs.delete(name);
        }

        logger.info('Cron service stopped');
    }

    setupDailyDataSync() {
        // Run at 6:00 PM IST every day (12:30 UTC)
        const job = cron.schedule('30 12 * * *', async () => {
            logger.info('Starting daily data sync');

            try {
                const today = new Date();
                const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

                for (const symbol of this.keySymbols) {
                    for (const timeframe of this.timeframes) {
                        try {
                            await marketDataService.fetchHistoricalData(
                                symbol,
                                timeframe,
                                thirtyDaysAgo.toISOString(),
                                today.toISOString()
                            );

                            logger.info('Historical data synced', {
                                symbol,
                                timeframe
                            });

                        } catch (error) {
                            logger.error('Error syncing historical data', {
                                symbol,
                                timeframe,
                                error: error.message
                            });
                        }

                        // Add delay between requests to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }

                logger.info('Daily data sync completed');

            } catch (error) {
                logger.error('Error in daily data sync job', {
                    error: error.message
                });
            }
        }, {
            scheduled: true,
            timezone: 'Asia/Kolkata'
        });

        this.jobs.set('dailyDataSync', job);
    }

    setupPortfolioSync() {
        // Run every 15 minutes during market hours (9:15 AM to 3:30 PM IST)
        const job = cron.schedule('*/15 3-10 * * 1-5', async () => {
            logger.info('Starting portfolio sync');

            try {
                // Update holdings and positions
                await Promise.all([
                    portfolioService.getHoldings(),
                    portfolioService.getPositions()
                ]);

                logger.info('Portfolio sync completed');

            } catch (error) {
                logger.error('Error in portfolio sync job', {
                    error: error.message
                });
            }
        }, {
            scheduled: true,
            timezone: 'Asia/Kolkata'
        });

        this.jobs.set('portfolioSync', job);
    }

    setupTokenRefresh() {
        // Clear existing job if any
        if (this.jobs.has('tokenRefresh')) {
            clearInterval(this.jobs.get('tokenRefresh'));
        }

        // Set up new refresh job - runs every 6 hours
        const refreshJob = setInterval(async () => {
            try {
                logger.info('Starting token refresh');
                // For now, just log a warning since auto-refresh isn't available
                logger.warn('Token refresh mechanism not implemented', {
                    message: 'Manual token refresh required every 30 days'
                });
                
                // Check token expiry
                const token = process.env.ACCESS_TOKEN;
                if (token) {
                    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                    const expiryDate = new Date(payload.exp * 1000);
                    const daysUntilExpiry = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                    
                    if (daysUntilExpiry <= 5) {
                        logger.warn('Access token expiring soon', {
                            daysRemaining: daysUntilExpiry
                        });
                    }
                }
            } catch (error) {
                logger.error('Error in token refresh:', error);
            }
        }, 6 * 60 * 60 * 1000); // 6 hours

        this.jobs.set('tokenRefresh', refreshJob);
    }

    // Method to manually trigger data sync for a specific symbol
    async syncSymbolData(symbol, timeframe, days = 30) {
        try {
            const today = new Date();
            const startDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));

            await marketDataService.fetchHistoricalData(
                symbol,
                timeframe,
                startDate.toISOString(),
                today.toISOString()
            );

            logger.info('Manual data sync completed', {
                symbol,
                timeframe,
                days
            });

        } catch (error) {
            logger.error('Error in manual data sync', {
                symbol,
                timeframe,
                error: error.message
            });
            throw error;
        }
    }
}

// Export the CronService class
module.exports = CronService;