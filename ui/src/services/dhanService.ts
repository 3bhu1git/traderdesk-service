import axios from 'axios';
import { getApiBaseUrl } from '../lib/getApiBaseUrl';

const DHAN_API_KEY = process.env.DHAN_API_KEY;
const DHAN_BASE_URL = getApiBaseUrl();

interface MarketData {
  nifty: { value: number; change: number; changePercent: number };
  sensex: { value: number; change: number; changePercent: number };
  bankNifty: { value: number; change: number; changePercent: number };
}

interface StockData {
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
}

interface OptionChainData {
  expiryDates: string[];
  strikePrices: number[];
  calls: any[];
  puts: any[];
}

export const DHANService = {
  getMarketData: async (): Promise<MarketData> => {
    try {
      const response = await axios.get(`${DHAN_BASE_URL}/market/indices`, {
        headers: { 'x-api-key': DHAN_API_KEY }
      });
      
      return {
        nifty: {
          value: response.data.nifty.last,
          change: response.data.nifty.change,
          changePercent: response.data.nifty.percentChange
        },
        sensex: {
          value: response.data.sensex.last,
          change: response.data.sensex.change,
          changePercent: response.data.sensex.percentChange
        },
        bankNifty: {
          value: response.data.bankNifty.last,
          change: response.data.bankNifty.change,
          changePercent: response.data.bankNifty.percentChange
        }
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  },

  getTopGainers: async (limit: number = 5): Promise<StockData[]> => {
    try {
      const response = await axios.get(`${DHAN_BASE_URL}/market/top-gainers?limit=${limit}`, {
        headers: { 'x-api-key': DHAN_API_KEY }
      });
      return response.data.map((stock: any) => ({
        symbol: stock.symbol,
        ltp: stock.lastPrice,
        change: stock.change,
        changePercent: stock.percentChange
      }));
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      throw error;
    }
  },

  getTopLosers: async (limit: number = 5): Promise<StockData[]> => {
    try {
      const response = await axios.get(`${DHAN_BASE_URL}/market/top-losers?limit=${limit}`, {
        headers: { 'x-api-key': DHAN_API_KEY }
      });
      return response.data.map((stock: any) => ({
        symbol: stock.symbol,
        ltp: stock.lastPrice,
        change: stock.change,
        changePercent: stock.percentChange
      }));
    } catch (error) {
      console.error('Error fetching top losers:', error);
      throw error;
    }
  },

  getSectorData: async (): Promise<any> => {
    try {
      const response = await axios.get(`${DHAN_BASE_URL}/market/sectors`, {
        headers: { 'x-api-key': DHAN_API_KEY }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sector data:', error);
      throw error;
    }
  },

  getFIIDIIData: async (days: number = 1): Promise<any> => {
    try {
      const response = await axios.get(`${DHAN_BASE_URL}/market/fii-dii?days=${days}`, {
        headers: { 'x-api-key': DHAN_API_KEY }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching FII/DII data:', error);
      throw error;
    }
  },

  getStockData: async (symbol: string): Promise<any> => {
    try {
      const response = await axios.get(`${DHAN_BASE_URL}/stocks/${symbol}`, {
        headers: { 'x-api-key': DHAN_API_KEY }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      throw error;
    }
  },

  getOptionChainData: async (symbol: string, expiryDate: string): Promise<OptionChainData> => {
    try {
      const response = await axios.get(
        `${DHAN_BASE_URL}/options/chain/${symbol}?expiry=${expiryDate}`,
        { headers: { 'x-api-key': DHAN_API_KEY } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching option chain data:', error);
      throw error;
    }
  },

  getExpiryDates: async (symbol: string): Promise<string[]> => {
    try {
      const response = await axios.get(`${DHAN_BASE_URL}/options/expiries/${symbol}`, {
        headers: { 'x-api-key': DHAN_API_KEY }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching expiry dates:', error);
      throw error;
    }
  },

  searchStocks: async (query: string): Promise<any[]> => {
    try {
      const response = await axios.get(`${DHAN_BASE_URL}/stocks/search?q=${query}`, {
        headers: { 'x-api-key': DHAN_API_KEY }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  }
};