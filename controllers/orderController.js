const orderService = require('../services/order');
const { logger } = require('../utils/logger');

class OrderController {
    /**
     * Place a new order
     * @route POST /place-order
     */
    async placeOrder(req, res) {
        try {
            const orderData = req.body;
            const order = await orderService.placeOrder(orderData);

            logger.info('Order placed successfully', {
                orderId: order.orderId,
                symbol: order.symbol
            });

            res.status(201).json(order);
        } catch (error) {
            logger.error('Error placing order', {
                orderData: req.body,
                error: error.message
            });
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Modify an existing order
     * @route PUT /modify-order/:orderId
     */
    async modifyOrder(req, res) {
        try {
            const { orderId } = req.params;
            const modifications = req.body;

            const order = await orderService.modifyOrder(orderId, modifications);

            logger.info('Order modified successfully', {
                orderId,
                modifications
            });

            res.json(order);
        } catch (error) {
            logger.error('Error modifying order', {
                orderId: req.params.orderId,
                modifications: req.body,
                error: error.message
            });
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Cancel an order
     * @route DELETE /cancel-order/:orderId
     */
    async cancelOrder(req, res) {
        try {
            const { orderId } = req.params;
            const order = await orderService.cancelOrder(orderId);

            logger.info('Order cancelled successfully', { orderId });

            res.json(order);
        } catch (error) {
            logger.error('Error cancelling order', {
                orderId: req.params.orderId,
                error: error.message
            });
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get order status
     * @route GET /order-status/:orderId
     */
    async getOrderStatus(req, res) {
        try {
            const { orderId } = req.params;
            const status = await orderService.getOrderStatus(orderId);

            res.json(status);
        } catch (error) {
            logger.error('Error fetching order status', {
                orderId: req.params.orderId,
                error: error.message
            });
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get order history
     * @route GET /orders
     */
    async getOrderHistory(req, res) {
        try {
            const filters = {
                symbol: req.query.symbol,
                status: req.query.status,
                startDate: req.query.start_date,
                endDate: req.query.end_date,
                limit: parseInt(req.query.limit) || 100
            };

            const orders = await orderService.getOrderHistory(filters);

            res.json(orders);
        } catch (error) {
            logger.error('Error fetching order history', {
                filters: req.query,
                error: error.message
            });
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new OrderController();