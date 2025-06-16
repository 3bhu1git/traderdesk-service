const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

// Default to environment variable
let accessToken = process.env.ACCESS_TOKEN;
let clientId = process.env.CLIENT_ID;

// Function to check if we're in a browser environment
const isBrowser = () => {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
};

// Function to get access token with localStorage fallback for browser environments
const getAccessToken = () => {
    // If in browser, try to get from localStorage first
    if (isBrowser()) {
        const storedToken = localStorage.getItem('dhan_access_token');
        if (storedToken) {
            return storedToken;
        }
    }
    
    // Fallback to environment variable
    if (!accessToken) {
        throw new Error('Access token is not available. Please set it in the form or environment variables.');
    }
    return accessToken;
};

// Function to get client ID with localStorage fallback
const getClientId = () => {
    // If in browser, try to get from localStorage first
    if (isBrowser()) {
        const storedClientId = localStorage.getItem('dhan_client_id');
        if (storedClientId) {
            return storedClientId;
        }
    }
    
    // Fallback to environment variable
    if (!clientId) {
        throw new Error('Client ID is not available. Please set it in the form or environment variables.');
    }
    return clientId;
};

const getToken = () => {
    return getAccessToken();
};

const refreshTokenIfNeeded = async () => {
    // Logic to check if the token is expired and refresh it if necessary
    // This can be based on token expiry time or other criteria
    // For now, we will just return the current token
    return getToken();
};

module.exports = {
    getAccessToken,
    getClientId,
    getToken,
    refreshTokenIfNeeded
};