const marketDataService = require('../services/marketData');
const { logger } = require('../utils/logger');

class MarketDataController {
    /**
     * Get live price for a symbol
     * @route GET /live-price/:symbol
     */
    async getLivePrice(req, res) {
        try {
            const { symbol } = req.params;
            const data = await marketDataService.getLivePrice(symbol);
            res.json(data);
        } catch (error) {
            logger.error('Error in getLivePrice', {
                symbol: req.params.symbol,
                error: error.message
            });
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Stream live price updates via SSE
     * @route GET /live-price-stream/:symbol
     */
    async streamLivePrice(req, res) {
        try {
            const { symbol } = req.params;
            marketDataService.setupLivePriceStream(symbol, res);
        } catch (error) {
            logger.error('Error in streamLivePrice', {
                symbol: req.params.symbol,
                error: error.message
            });
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get historical data for a symbol
     * @route GET /historical-data/:symbol
     */
    async getHistoricalData(req, res) {
        try {
            const { symbol } = req.params;
            const { timeframe, from_date, to_date } = req.query;

            if (!timeframe || !from_date || !to_date) {
                return res.status(400).json({
                    error: 'Missing required parameters: timeframe, from_date, to_date'
                });
            }

            const data = await marketDataService.fetchHistoricalData(
                symbol,
                timeframe,
                from_date,
                to_date
            );

            // Format data for charting if requested
            if (req.query.format === 'chart') {
                const chartData = marketDataService.formatChartData(data);
                return res.json(chartData);
            }

            res.json(data);
        } catch (error) {
            logger.error('Error in getHistoricalData', {
                symbol: req.params.symbol,
                query: req.query,
                error: error.message
            });
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get supported symbols
     * @route GET /symbols
     */
    async getSupportedSymbols(req, res) {
        try {
            const symbols = await marketDataService.getSupportedSymbols();
            res.json(symbols);
        } catch (error) {
            logger.error('Error in getSupportedSymbols', {
                error: error.message
            });
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get backtest data for a symbol
     * @route GET /backtest/:symbol
     */
    async getBacktestData(req, res) {
        try {
            const { symbol } = req.params;
            const {
                timeframe = '1d',
                from_date,
                to_date,
                indicators
            } = req.query;

            if (!from_date || !to_date) {
                return res.status(400).json({
                    error: 'Missing required parameters: from_date, to_date'
                });
            }

            // Fetch historical data
            const data = await marketDataService.fetchHistoricalData(
                symbol,
                timeframe,
                from_date,
                to_date
            );

            // Format data for charting
            let formattedData = marketDataService.formatChartData(data);

            // Add technical indicators if requested
            if (indicators) {
                const indicatorList = indicators.split(',');
                // TODO: Implement technical indicators calculation
                // This would require additional technical analysis library
                logger.info('Technical indicators requested but not implemented', {
                    indicators: indicatorList
                });
            }

            res.json(formattedData);
        } catch (error) {
            logger.error('Error in getBacktestData', {
                symbol: req.params.symbol,
                query: req.query,
                error: error.message
            });
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new MarketDataController();