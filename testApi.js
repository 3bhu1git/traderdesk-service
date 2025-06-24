// testApi.js
// Simple API test script for Codespaces base URL

const axios = require('axios');

const BASE_URL = 'https://automatic-telegram-6r7ww5gw574h456r-3000.app.github.dev';

async function testApi() {
  try {
    // Change the endpoint below to any valid endpoint you want to test
    const response = await axios.get(`${BASE_URL}/api/market/status`);
    console.log('API Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Request Error:', error.message);
    }
  }
}

testApi();
