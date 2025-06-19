import axios from 'axios';

// Types for NSE data
export interface NSEMarketData {
  nifty: { value: number; change: number; changePercent: number };
  sensex: { value: number; change: number; changePercent: number };
  bankNifty: { value: number; change: number; changePercent: number };
  vix: { value: number; change: number; changePercent: number };
  advanceDecline: { advances: number; declines: number; unchanged: number };
}

export interface NSESectorData {
  name: string;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  price: number;
  high52w: number;
  low52w: number;
  pe: number;
  momentum: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  strength: number;
  rotation: 'inflow' | 'outflow' | 'neutral';
}

export interface NSEFIIDIIData {
  date: string;
  fiiSell: number;
  fiiBuy: number;
  diiSell: number;
  diiBuy: number;
  fiiNet: number;
  diiNet: number;
}

export interface NSEStockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  exchange?: string;
}

export class NSEDataService {
  // NSE API endpoints
  private static readonly NSE_API_BASE_URL = '/api/nse';
  
  // Headers required for NSE API requests
  private static readonly headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.nseindia.com/',
    'Origin': 'https://www.nseindia.com',
    'Connection': 'keep-alive'
  };

  // Get market data (indices)
  public static async getMarketData(): Promise<NSEMarketData> {
    try {
      // For demo purposes, we'll return real-like data
      // In a production environment, this would be a real API call
      return {
        nifty: { value: 19745.30, change: 165.85, changePercent: 0.86 },
        sensex: { value: 65721.25, change: 425.60, changePercent: 0.65 },
        bankNifty: { value: 44235.80, change: 285.45, changePercent: 0.65 },
        vix: { value: 11.25, change: -0.85, changePercent: -6.02 },
        advanceDecline: { advances: 1847, declines: 1203, unchanged: 150 }
      };
    } catch (error) {
      console.error('Failed to fetch NSE market data:', error);
      // Return fallback data in case of error
      return this.getFallbackMarketData();
    }
  }

  // Get sector data
  public static async getSectorData(): Promise<NSESectorData[]> {
    try {
      // For demo purposes, we'll return real-like data
      return this.getFallbackSectorData();
    } catch (error) {
      console.error('Failed to fetch NSE sector data:', error);
      // Return fallback data in case of error
      return this.getFallbackSectorData();
    }
  }

  // Get FII/DII data
  public static async getFIIDIIData(days: number = 10): Promise<NSEFIIDIIData[]> {
    try {
      // For demo purposes, we'll return real-like data
      return this.getFallbackFIIDIIData(days);
    } catch (error) {
      console.error('Failed to fetch NSE FII/DII data:', error);
      // Return fallback data in case of error
      return this.getFallbackFIIDIIData(days);
    }
  }

  // Get top gainers
  public static async getTopGainers(limit: number = 5): Promise<NSEStockData[]> {
    try {
      // For demo purposes, we'll return real-like data
      return this.getFallbackTopGainers(limit);
    } catch (error) {
      console.error('Failed to fetch NSE top gainers:', error);
      // Return fallback data in case of error
      return this.getFallbackTopGainers(limit);
    }
  }

  // Get top losers
  public static async getTopLosers(limit: number = 5): Promise<NSEStockData[]> {
    try {
      // For demo purposes, we'll return real-like data
      return this.getFallbackTopLosers(limit);
    } catch (error) {
      console.error('Failed to fetch NSE top losers:', error);
      // Return fallback data in case of error
      return this.getFallbackTopLosers(limit);
    }
  }

  // Get stock data by symbol
  public static async getStockData(symbol: string): Promise<NSEStockData | null> {
    try {
      // For demo purposes, we'll return real-like data based on the symbol
      const topGainers = this.getFallbackTopGainers(10);
      const topLosers = this.getFallbackTopLosers(10);
      
      // Try to find the stock in our mock data
      const stock = [...topGainers, ...topLosers].find(s => s.symbol === symbol);
      
      if (stock) {
        return stock;
      }
      
      // If not found, generate a random stock
      return {
        symbol,
        name: symbol,
        price: 1000 + Math.random() * 2000,
        change: Math.random() * 40 - 20,
        changePercent: Math.random() * 4 - 2,
        volume: Math.floor(Math.random() * 1000000),
        marketCap: Math.random() * 500000,
        pe: Math.random() * 30 + 10
      };
    } catch (error) {
      console.error(`Failed to fetch NSE stock data for ${symbol}:`, error);
      // Return null in case of error
      return null;
    }
  }

  // Get option chain data
  public static async getOptionChainData(symbol: string, expiryDate?: string): Promise<any[]> {
    try {
      // For demo purposes, we'll generate realistic option chain data
      const basePrice = symbol === 'NIFTY' ? 19745 : 
                       symbol === 'BANKNIFTY' ? 44235 : 
                       symbol === 'RELIANCE' ? 2520 : 
                       symbol === 'TCS' ? 3620 : 
                       symbol === 'HDFCBANK' ? 1580 : 1000;
      
      const strikes = [];
      const strikeDiff = symbol === 'NIFTY' ? 50 : 
                        symbol === 'BANKNIFTY' ? 100 : 
                        symbol === 'RELIANCE' ? 20 : 
                        symbol === 'TCS' ? 20 : 
                        symbol === 'HDFCBANK' ? 10 : 10;
      
      // Generate strikes around the base price
      for (let i = -10; i <= 10; i++) {
        const strike = Math.round(basePrice + (i * strikeDiff));
        
        // Calculate OI and IV based on distance from ATM
        const distanceFromATM = Math.abs(i);
        const ceOI = Math.round(1000000 * (1 - (distanceFromATM * 0.05)));
        const peOI = Math.round(1000000 * (1 - (distanceFromATM * 0.05)));
        
        // Higher IV for strikes further from ATM
        const ceIV = 15 + distanceFromATM * 0.5 + Math.random() * 5;
        const peIV = 15 + distanceFromATM * 0.5 + Math.random() * 5;
        
        strikes.push({
          strike,
          ce_oi: Math.max(100000, ceOI),
          pe_oi: Math.max(100000, peOI),
          ce_volume: Math.round(ceOI * 0.1),
          pe_volume: Math.round(peOI * 0.1),
          ce_iv: ceIV,
          pe_iv: peIV
        });
      }
      
      return strikes;
    } catch (error) {
      console.error(`Failed to fetch NSE option chain data for ${symbol}:`, error);
      // Return empty array in case of error
      return [];
    }
  }

  // Get available expiry dates for a symbol
  public static async getExpiryDates(symbol: string): Promise<string[]> {
    try {
      // For demo purposes, we'll generate realistic expiry dates
      const today = new Date();
      const expiryDates = [];
      
      // Current month expiry - last Thursday of the month
      const currentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      let lastThursday = new Date(currentMonth);
      lastThursday.setDate(currentMonth.getDate() - ((currentMonth.getDay() + 3) % 7));
      
      // Next month expiry
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      let nextMonthLastThursday = new Date(nextMonth);
      nextMonthLastThursday.setDate(nextMonth.getDate() - ((nextMonth.getDay() + 3) % 7));
      
      // Format dates as YYYY-MM-DD
      expiryDates.push(lastThursday.toISOString().split('T')[0]);
      expiryDates.push(nextMonthLastThursday.toISOString().split('T')[0]);
      
      // Add weekly expiries for indices
      if (symbol === 'NIFTY' || symbol === 'BANKNIFTY') {
        // Next 4 Thursdays
        const nextThursday = new Date(today);
        nextThursday.setDate(today.getDate() + ((11 - today.getDay()) % 7));
        
        for (let i = 0; i < 4; i++) {
          const thursday = new Date(nextThursday);
          thursday.setDate(nextThursday.getDate() + (i * 7));
          expiryDates.push(thursday.toISOString().split('T')[0]);
        }
      }
      
      // Sort and remove duplicates
      return [...new Set(expiryDates)].sort();
    } catch (error) {
      console.error(`Failed to fetch NSE expiry dates for ${symbol}:`, error);
      // Return empty array in case of error
      return [];
    }
  }

  // Search for stocks
  public static async searchStocks(query: string): Promise<NSEStockData[]> {
    try {
      if (!query || query.length < 2) return [];
      
      // For demo purposes, we'll search through our mock data
      const allStocks = [
        ...this.getFallbackTopGainers(50),
        ...this.getFallbackTopLosers(50),
        // Add common indices
        { symbol: 'NIFTY', name: 'Nifty 50 Index', price: 19745.30, change: 165.85, changePercent: 0.86, volume: 0 },
        { symbol: 'BANKNIFTY', name: 'Bank Nifty Index', price: 44235.80, change: 285.45, changePercent: 0.65, volume: 0 },
        { symbol: 'FINNIFTY', name: 'Fin Nifty Index', price: 21345.60, change: 178.25, changePercent: 0.84, volume: 0 }
      ];
      
      // Filter stocks that match the query
      const normalizedQuery = query.toUpperCase();
      return allStocks.filter(stock => 
        stock.symbol.includes(normalizedQuery) || 
        stock.name.toUpperCase().includes(normalizedQuery)
      ).slice(0, 10);
    } catch (error) {
      console.error(`Failed to search NSE stocks for "${query}":`, error);
      // Return empty array in case of error
      return [];
    }
  }

  // Mock historical data for chart
  public static async getHistoricalData(symbol: string): Promise<any[]> {
    // Generate 30 days of 5m candles
    const candles = [];
    const now = new Date();
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    let current = new Date(start);
    let lastClose = 1000 + Math.random() * 1000;
    while (current < now) {
      const open = lastClose;
      const high = open + Math.random() * 10;
      const low = open - Math.random() * 10;
      const close = low + Math.random() * (high - low);
      candles.push({
        timestamp: current.toISOString(),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
      });
      lastClose = close;
      current = new Date(current.getTime() + 5 * 60 * 1000); // next 5m
    }
    return candles;
  }

  // Fallback data methods
  private static getFallbackMarketData(): NSEMarketData {
    return {
      nifty: { value: 19745.30, change: 165.85, changePercent: 0.86 },
      sensex: { value: 65721.25, change: 425.60, changePercent: 0.65 },
      bankNifty: { value: 44235.80, change: 285.45, changePercent: 0.65 },
      vix: { value: 11.25, change: -0.85, changePercent: -6.02 },
      advanceDecline: { advances: 1847, declines: 1203, unchanged: 150 }
    };
  }

  private static getFallbackSectorData(): NSESectorData[] {
    return [
      { 
        name: 'Nifty Bank', 
        change: 245.8, 
        changePercent: 1.2, 
        volume: '2.5B', 
        marketCap: '15.2L Cr',
        price: 44235.80,
        high52w: 48636.85,
        low52w: 39631.40,
        pe: 12.8,
        momentum: 'strong_buy',
        strength: 85,
        rotation: 'inflow'
      },
      { 
        name: 'Nifty IT', 
        change: -128.4, 
        changePercent: -0.8, 
        volume: '1.8B', 
        marketCap: '12.8L Cr',
        price: 32450.75,
        high52w: 36252.80,
        low52w: 27827.15,
        pe: 22.5,
        momentum: 'hold',
        strength: 45,
        rotation: 'outflow'
      },
      { 
        name: 'Nifty Auto', 
        change: 89.2, 
        changePercent: 0.6, 
        volume: '980M', 
        marketCap: '8.5L Cr',
        price: 18680.45,
        high52w: 20179.90,
        low52w: 16500.80,
        pe: 18.3,
        momentum: 'buy',
        strength: 72,
        rotation: 'inflow'
      },
      { 
        name: 'Nifty Pharma', 
        change: 156.7, 
        changePercent: 1.1, 
        volume: '750M', 
        marketCap: '6.2L Cr',
        price: 15850.90,
        high52w: 16290.65,
        low52w: 12800.25,
        pe: 25.6,
        momentum: 'buy',
        strength: 78,
        rotation: 'inflow'
      },
      { 
        name: 'Nifty FMCG', 
        change: -45.3, 
        changePercent: -0.3, 
        volume: '650M', 
        marketCap: '9.8L Cr',
        price: 48920.60,
        high52w: 51430.55,
        low52w: 38500.70,
        pe: 35.2,
        momentum: 'hold',
        strength: 52,
        rotation: 'neutral'
      },
      { 
        name: 'Nifty Energy', 
        change: 78.9, 
        changePercent: 0.9, 
        volume: '1.2B', 
        marketCap: '11.5L Cr',
        price: 32850.25,
        high52w: 35200.45,
        low52w: 28900.30,
        pe: 15.8,
        momentum: 'buy',
        strength: 68,
        rotation: 'inflow'
      },
      { 
        name: 'Nifty Metal', 
        change: -234.5, 
        changePercent: -1.8, 
        volume: '890M', 
        marketCap: '4.8L Cr',
        price: 7420.80,
        high52w: 8500.35,
        low52w: 5800.20,
        pe: 8.9,
        momentum: 'sell',
        strength: 25,
        rotation: 'outflow'
      },
      { 
        name: 'Nifty Realty', 
        change: 45.6, 
        changePercent: 2.1, 
        volume: '320M', 
        marketCap: '2.1L Cr',
        price: 850.40,
        high52w: 920.15,
        low52w: 620.30,
        pe: 12.4,
        momentum: 'strong_buy',
        strength: 88,
        rotation: 'inflow'
      },
      { 
        name: 'Nifty Media', 
        change: -67.8, 
        changePercent: -1.2, 
        volume: '450M', 
        marketCap: '3.8L Cr',
        price: 2120.30,
        high52w: 2500.45,
        low52w: 1900.25,
        pe: 18.7,
        momentum: 'sell',
        strength: 32,
        rotation: 'outflow'
      },
      { 
        name: 'Nifty Consumer Durables', 
        change: 123.4, 
        changePercent: 1.8, 
        volume: '280M', 
        marketCap: '1.9L Cr',
        price: 32890.60,
        high52w: 34500.75,
        low52w: 28800.40,
        pe: 28.3,
        momentum: 'strong_buy',
        strength: 82,
        rotation: 'inflow'
      }
    ];
  }

  private static getFallbackFIIDIIData(days: number): NSEFIIDIIData[] {
    // Generate dates for the last 'days' days
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    
    // Generate realistic FII/DII data
    return dates.map(date => {
      // Generate realistic values with some randomness but following trends
      const fiiBuy = 6000 + Math.floor(Math.random() * 4000);
      const fiiSell = 5500 + Math.floor(Math.random() * 4000);
      const diiBuy = 7000 + Math.floor(Math.random() * 3000);
      const diiSell = 4000 + Math.floor(Math.random() * 3000);
      
      return {
        date,
        fiiBuy,
        fiiSell,
        diiBuy,
        diiSell,
        fiiNet: fiiBuy - fiiSell,
        diiNet: diiBuy - diiSell
      };
    });
  }

  private static getFallbackTopGainers(limit: number): NSEStockData[] {
    return [
      { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ', price: 985.60, change: 28.45, changePercent: 3.76, volume: 3500000, marketCap: 180000, pe: 24.3 },
      { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', price: 1025.30, change: 25.30, changePercent: 3.25, volume: 4200000, marketCap: 270000, pe: 18.5 },
      { symbol: 'HINDALCO', name: 'Hindalco Industries', price: 875.75, change: 18.75, changePercent: 2.85, volume: 2800000, marketCap: 150000, pe: 12.8 },
      { symbol: 'SBIN', name: 'State Bank of India', price: 850.60, change: 15.60, changePercent: 2.45, volume: 5100000, marketCap: 580000, pe: 9.2 },
      { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', price: 942.20, change: 14.20, changePercent: 1.95, volume: 3800000, marketCap: 230000, pe: 11.5 },
      { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd.', price: 1385.45, change: 23.75, changePercent: 1.75, volume: 2100000, marketCap: 95000, pe: 14.2 },
      { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', price: 7250.80, change: 120.30, changePercent: 1.69, volume: 1800000, marketCap: 420000, pe: 32.5 },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1580.25, change: 25.45, changePercent: 1.64, volume: 6200000, marketCap: 880000, pe: 18.7 },
      { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2520.30, change: 38.75, changePercent: 1.56, volume: 5800000, marketCap: 1650000, pe: 21.3 },
      { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1750.60, change: 24.80, changePercent: 1.44, volume: 2900000, marketCap: 340000, pe: 22.8 }
    ].slice(0, limit);
  }

  private static getFallbackTopLosers(limit: number): NSEStockData[] {
    return [
      { symbol: 'TECHM', name: 'Tech Mahindra Ltd.', price: 1305.55, change: -28.45, changePercent: -2.76, volume: 1800000, marketCap: 98000, pe: 19.2 },
      { symbol: 'WIPRO', name: 'Wipro Ltd.', price: 1268.70, change: -22.30, changePercent: -2.25, volume: 2100000, marketCap: 105000, pe: 18.7 },
      { symbol: 'HCLTECH', name: 'HCL Technologies', price: 1295.25, change: -18.75, changePercent: -1.85, volume: 1500000, marketCap: 135000, pe: 17.5 },
      { symbol: 'INFY', name: 'Infosys Ltd.', price: 1360.40, change: -15.60, changePercent: -1.45, volume: 2800000, marketCap: 440000, pe: 22.8 },
      { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3620.80, change: -34.20, changePercent: -1.25, volume: 1900000, marketCap: 410000, pe: 25.3 },
      { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', price: 1120.35, change: -12.45, changePercent: -1.10, volume: 1600000, marketCap: 268000, pe: 28.4 },
      { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories', price: 5480.60, change: -58.30, changePercent: -1.05, volume: 950000, marketCap: 91000, pe: 32.1 },
      { symbol: 'CIPLA', name: 'Cipla Ltd.', price: 1175.40, change: -11.80, changePercent: -0.99, volume: 1200000, marketCap: 94800, pe: 26.7 },
      { symbol: 'DIVISLAB', name: 'Divi\'s Laboratories', price: 3650.25, change: -35.20, changePercent: -0.96, volume: 850000, marketCap: 97000, pe: 35.2 },
      { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', price: 3180.75, change: -28.90, changePercent: -0.90, volume: 1100000, marketCap: 305000, pe: 42.5 }
    ].slice(0, limit);
  }
}