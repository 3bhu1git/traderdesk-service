const axios = require('axios');
const config = require('../config/config');
const { logger } = require('../utils/logger');
const Order = require('../models/order');

class OrderService {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: config.dhan.baseUrl,
            headers: {
                'Authorization': `Bearer ${config.dhan.accessToken}`,
                'X-Api-Key': config.dhan.apiKey,
                'Content-Type': 'application/json'
            }
        });
    }

    async placeOrder(orderData) {
        try {
            // Validate order data
            this.validateOrderData(orderData);

            // Place order with Dhan API
            const response = await this.axiosInstance.post('/orders', orderData);

            if (!response.data || !response.data.orderId) {
                throw new Error('Invalid response from Dhan API');
            }

            // Create order record in database
            const order = new Order({
                orderId: response.data.orderId,
                symbol: orderData.symbol,
                exchange: orderData.exchange || 'NSE',
                quantity: orderData.quantity,
                transactionType: orderData.transactionType,
                orderType: orderData.orderType,
                productType: orderData.productType,
                price: orderData.price,
                triggerPrice: orderData.triggerPrice,
                validity: orderData.validity || 'DAY',
                validityDate: orderData.validityDate,
                status: 'PENDING'
            });

            await order.save();

            logger.info('Order placed successfully', {
                orderId: order.orderId,
                symbol: order.symbol
            });

            return order;

        } catch (error) {
            logger.error('Error placing order', {
                error: error.message,
                orderData
            });
            throw error;
        }
    }

    async modifyOrder(orderId, modifications) {
        try {
            // Find existing order
            const order = await Order.findOne({ orderId });
            if (!order) {
                throw new Error('Order not found');
            }

            // Validate modifications
            this.validateModifications(modifications);

            // Send modification request to Dhan API
            const response = await this.axiosInstance.put(`/orders/${orderId}`, modifications);

            if (!response.data || !response.data.success) {
                throw new Error('Order modification failed');
            }

            // Update order in database
            await order.modify(modifications);

            logger.info('Order modified successfully', {
                orderId,
                modifications
            });

            return order;

        } catch (error) {
            logger.error('Error modifying order', {
                orderId,
                modifications,
                error: error.message
            });
            throw error;
        }
    }

    async cancelOrder(orderId) {
        try {
            // Find existing order
            const order = await Order.findOne({ orderId });
            if (!order) {
                throw new Error('Order not found');
            }

            // Send cancellation request to Dhan API
            const response = await this.axiosInstance.delete(`/orders/${orderId}`);

            if (!response.data || !response.data.success) {
                throw new Error('Order cancellation failed');
            }

            // Update order status in database
            await order.cancel();

            logger.info('Order cancelled successfully', { orderId });

            return order;

        } catch (error) {
            logger.error('Error cancelling order', {
                orderId,
                error: error.message
            });
            throw error;
        }
    }

    async getOrderStatus(orderId) {
        try {
            // Get status from Dhan API
            const response = await this.axiosInstance.get(`/orders/${orderId}`);

            if (!response.data) {
                throw new Error('Invalid response from Dhan API');
            }

            // Update order in database
            const order = await Order.findOne({ orderId });
            if (order) {
                order.status = response.data.status;
                order.filledQuantity = response.data.filledQuantity;
                order.averagePrice = response.data.averagePrice;
                order.lastModified = new Date();
                await order.save();
            }

            return response.data;

        } catch (error) {
            logger.error('Error fetching order status', {
                orderId,
                error: error.message
            });
            throw error;
        }
    }

    validateOrderData(orderData) {
        const requiredFields = ['symbol', 'quantity', 'transactionType', 'orderType', 'productType'];
        const missingFields = requiredFields.filter(field => !orderData[field]);

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        if (orderData.orderType === 'LIMIT' && !orderData.price) {
            throw new Error('Price is required for LIMIT orders');
        }

        if ((orderData.orderType === 'SL' || orderData.orderType === 'SL-M') && !orderData.triggerPrice) {
            throw new Error('Trigger price is required for SL/SL-M orders');
        }

        if (orderData.validity === 'GTD' && !orderData.validityDate) {
            throw new Error('Validity date is required for GTD orders');
        }
    }

    validateModifications(modifications) {
        const allowedModifications = ['quantity', 'price', 'triggerPrice', 'validity', 'validityDate'];
        const invalidFields = Object.keys(modifications).filter(field => !allowedModifications.includes(field));

        if (invalidFields.length > 0) {
            throw new Error(`Invalid modification fields: ${invalidFields.join(', ')}`);
        }
    }

    async getOrderHistory(filters = {}) {
        try {
            const query = {};

            if (filters.symbol) query.symbol = filters.symbol;
            if (filters.status) query.status = filters.status;
            if (filters.startDate && filters.endDate) {
                query.orderTimestamp = {
                    $gte: new Date(filters.startDate),
                    $lte: new Date(filters.endDate)
                };
            }

            const orders = await Order.find(query)
                .sort({ orderTimestamp: -1 })
                .limit(filters.limit || 100);

            return orders;

        } catch (error) {
            logger.error('Error fetching order history', {
                filters,
                error: error.message
            });
            throw error;
        }
    }
}

// Create singleton instance
const orderService = new OrderService();

module.exports = orderService;