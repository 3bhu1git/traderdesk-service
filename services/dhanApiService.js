const axios = require('axios');
const { getAccessToken, getClientId } = require('./tokenService');
const config = require('../config/config');

class DhanApiService {
    constructor() {
        this.apiClient = axios.create({
            baseURL: config.dhan.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAccessToken()}`,
                'access-token': getAccessToken(),
                'client-id': getClientId()
            }
        });
        
        // Add request interceptor to update headers with latest token on each request
        this.apiClient.interceptors.request.use(config => {
            // Update the headers with the latest token values
            config.headers['access-token'] = getAccessToken();
            config.headers['client-id'] = getClientId();
            return config;
        }, error => {
            return Promise.reject(error);
        });
    }

    async subscribeToMarketData(symbol) {
        try {
            const response = await this.apiClient.get(`/marketdata/${symbol}/subscribe`);
            return response.data;
        } catch (error) {
            throw new Error(`Error subscribing to market data: ${error.message}`);
        }
    }

    async fetchHistoricalData(symbol, timeframe, fromDate, toDate) {
        try {
            const response = await this.apiClient.get(`/marketdata/${symbol}`, {
                params: { timeframe, from_date: fromDate, to_date: toDate }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching historical data: ${error.message}`);
        }
    }

    async placeOrder(orderDetails) {
        try {
            const response = await this.apiClient.post('/orders', orderDetails);
            return response.data;
        } catch (error) {
            throw new Error(`Error placing order: ${error.message}`);
        }
    }

    async modifyOrder(orderId, orderDetails) {
        try {
            const response = await this.apiClient.put(`/orders/${orderId}`, orderDetails);
            return response.data;
        } catch (error) {
            throw new Error(`Error modifying order: ${error.message}`);
        }
    }

    async cancelOrder(orderId) {
        try {
            const response = await this.apiClient.delete(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error canceling order: ${error.message}`);
        }
    }

    async getOrderStatus(orderId) {
        try {
            const response = await this.apiClient.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching order status: ${error.message}`);
        }
    }
}

module.exports = new DhanApiService();