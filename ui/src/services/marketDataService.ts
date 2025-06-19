import * as Realm from 'realm-web';
import { DhanApiService } from './dhanApiService';

interface CandleData {
  symbol: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface DhanCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class MarketDataService {
  private static instance: MarketDataService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = '/api/market';
  }

  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  public async getHistoricalData(symbol: string, from: Date, to: Date): Promise<CandleData[]> {
    try {
      // First try to get data from our backend
      const response = await fetch(
        `${this.baseUrl}/historical-data?symbol=${symbol}&from=${from.toISOString()}&to=${to.toISOString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to get historical data: ${response.statusText}`);
      }

      const data = await response.json();

      // If no data found, fetch from Dhan API
      if (!data || data.length === 0) {
        console.log('No cached data found, fetching from Dhan API...');
        const dhanData = await DhanApiService.getHistoricalData(
          symbol,
          'NSE_EQ', // Default to NSE Equity
          '1m', // 1-minute interval
          from.toISOString(),
          to.toISOString()
        );
        
        if (dhanData && dhanData.length > 0) {
          // Transform Dhan data to our format
          const transformedData = dhanData.map((candle: DhanCandle) => ({
            symbol,
            timestamp: new Date(candle.time * 1000).toISOString(),
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume || 0
          }));

          // Save to our backend
          await this.saveHistoricalData(symbol, transformedData);
          return transformedData;
        }
      }

      return data;
    } catch (error) {
      console.error('Failed to get historical data:', error);
      throw error;
    }
  }

  public async saveHistoricalData(symbol: string, candles: CandleData[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/historical-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          candles
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save historical data: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to save historical data:', error);
      throw error;
    }
  }

  public async clearHistoricalData(symbol: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/historical-data/${symbol}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to clear historical data: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to clear historical data:', error);
      throw error;
    }
  }
} 