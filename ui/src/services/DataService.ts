import { NSEDataService } from './nseDataService';
import { DhanApiService } from './dhanApiService';
import { ScripMasterService } from './scripMasterService';
import { LocalStorageService, StockData, OptionChainData, FiiDiiData, SectorData } from '../lib/localStorage';
import { MarketDataService } from './marketDataService';

// Centralized data service to handle all data fetching operations
export class DataService {
  private static instance: DataService;
  private isDhanConnected: boolean = false;
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private marketDataService: MarketDataService;
  
  private constructor() {
    this.marketDataService = MarketDataService.getInstance();
    this.checkBrokerConnection();
  }
  
  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }
  
  private async checkBrokerConnection(): Promise<void> {
    const storedCredentials = localStorage.getItem('dhanCredentials');
    if (storedCredentials) {
      try {
        const credentials = JSON.parse(storedCredentials);
        DhanApiService.initialize(credentials);
        this.isDhanConnected = await DhanApiService.authenticate();
      } catch (error) {
        console.error('Error checking broker connection:', error);
        this.isDhanConnected = false;
      }
    }
  }
  
  // Cache management methods
  private getCachedData<T>(key: string): T | null {
    const cachedItem = this.cache.get(key);
    if (cachedItem && (Date.now() - cachedItem.timestamp) < this.cacheExpiry) {
      return cachedItem.data as T;
    }
    return null;
  }
  
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Persist data to localStorage based on data type
    if (key.startsWith('stock_')) {
      this.persistStockData(data);
    } else if (key.startsWith('option_chain_')) {
      this.persistOptionChainData(key, data);
    } else if (key === 'fii_dii_data') {
      this.persistFiiDiiData(data);
    } else if (key === 'sector_data') {
      this.persistSectorData(data);
    }
  }
  
  // Helper methods for persisting data to localStorage
  private persistStockData(data: any): void {
    if (!data || !data.symbol) return;
    
    try {
      const stockData: Omit<StockData, 'id' | 'createdAt' | 'updatedAt'> = {
        symbol: data.symbol,
        name: data.name || data.symbol,
        price: data.price || data.lastPrice || 0,
        change: data.change || 0,
        changePercent: data.changePercent || data.pChange || 0,
        volume: data.volume || 0,
        marketCap: data.marketCap || 0,
        peRatio: data.peRatio || data.pe || null,
        high: data.high || data.dayHigh || 0,
        low: data.low || data.dayLow || 0,
        open: data.open || 0,
        close: data.close || null,
        prevClose: data.prevClose || data.previousClose || 0,
        date: new Date().toISOString().split('T')[0],
        isLive: true
      };
      
      // Check if stock already exists for today
      const existingStocks = LocalStorageService.getByField<StockData>('stock_data', 'symbol', data.symbol)
        .filter(s => s.date === stockData.date);
      
      if (existingStocks.length > 0) {
        // Update existing stock
        LocalStorageService.update('stock_data', existingStocks[0].id, stockData);
      } else {
        // Create new stock
        LocalStorageService.create<StockData>('stock_data', stockData);
      }
    } catch (error) {
      console.error('Error persisting stock data to localStorage:', error);
    }
  }
  
  private persistOptionChainData(key: string, data: any[]): void {
    if (!data || !data.length) return;
    
    try {
      const parts = key.split('_');
      const symbol = parts[2];
      const expiryDate = parts[3] || new Date().toISOString().split('T')[0];
      const date = new Date().toISOString().split('T')[0];
      const time = new Date().toTimeString().split(' ')[0];
      
      // Delete old option chain data for this symbol and expiry
      const existingData = LocalStorageService.getAll<OptionChainData>('option_chain_data')
        .filter(item => item.symbol === symbol && item.expiryDate === expiryDate && item.date === date);
      
      existingData.forEach(item => {
        LocalStorageService.delete('option_chain_data', item.id);
      });
      
      // Add new option chain data
      data.forEach(item => {
        const optionData: Omit<OptionChainData, 'id' | 'createdAt' | 'updatedAt'> = {
          symbol,
          expiryDate,
          strike: item.strike,
          ceOi: item.ce_oi,
          peOi: item.pe_oi,
          ceVolume: item.ce_volume,
          peVolume: item.pe_volume,
          ceIv: item.ce_iv,
          peIv: item.pe_iv,
          date,
          time,
          isLive: true
        };
        
        LocalStorageService.create<OptionChainData>('option_chain_data', optionData);
      });
    } catch (error) {
      console.error('Error persisting option chain data to localStorage:', error);
    }
  }
  
  private persistFiiDiiData(data: any[]): void {
    if (!data || !data.length) return;
    
    try {
      // Delete old FII/DII data that's already in localStorage
      const existingDates = new Set(data.map(item => item.date));
      const existingData = LocalStorageService.getAll<FiiDiiData>('fii_dii_data')
        .filter(item => existingDates.has(item.date));
      
      existingData.forEach(item => {
        LocalStorageService.delete('fii_dii_data', item.id);
      });
      
      // Add new FII/DII data
      data.forEach(item => {
        const fiiDiiData: Omit<FiiDiiData, 'id' | 'createdAt' | 'updatedAt'> = {
          date: item.date,
          fiiSell: item.fiiSell,
          fiiBuy: item.fiiBuy,
          diiSell: item.diiSell,
          diiBuy: item.diiBuy,
          fiiNet: item.fiiNet,
          diiNet: item.diiNet
        };
        
        LocalStorageService.create<FiiDiiData>('fii_dii_data', fiiDiiData);
      });
    } catch (error) {
      console.error('Error persisting FII/DII data to localStorage:', error);
    }
  }
  
  private persistSectorData(data: any[]): void {
    if (!data || !data.length) return;
    
    try {
      const date = new Date().toISOString().split('T')[0];
      
      // Delete old sector data for today
      const existingData = LocalStorageService.getAll<SectorData>('sector_data')
        .filter(item => item.date === date);
      
      existingData.forEach(item => {
        LocalStorageService.delete('sector_data', item.id);
      });
      
      // Add new sector data
      data.forEach(item => {
        const sectorData: Omit<SectorData, 'id' | 'createdAt' | 'updatedAt'> = {
          name: item.name,
          change: item.change,
          changePercent: item.changePercent,
          volume: item.volume,
          marketCap: item.marketCap,
          date,
          price: item.price,
          high52w: item.high52w,
          low52w: item.low52w,
          pe: item.pe,
          momentum: item.momentum,
          strength: item.strength,
          rotation: item.rotation
        };
        
        LocalStorageService.create<SectorData>('sector_data', sectorData);
      });
    } catch (error) {
      console.error('Error persisting sector data to localStorage:', error);
    }
  }
  
  // Get data from localStorage
  private getPersistedStockData(symbol: string): StockData | null {
    try {
      const stocks = LocalStorageService.getByField<StockData>('stock_data', 'symbol', symbol);
      if (!stocks.length) return null;
      
      // Get the most recent stock data
      return stocks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    } catch (error) {
      console.error('Error getting stock data from localStorage:', error);
      return null;
    }
  }
  
  private getPersistedOptionChainData(symbol: string, expiryDate?: string): OptionChainData[] {
    try {
      let options = LocalStorageService.getByField<OptionChainData>('option_chain_data', 'symbol', symbol);
      
      if (expiryDate) {
        options = options.filter(item => item.expiryDate === expiryDate);
      }
      
      if (!options.length) return [];
      
      // Get the most recent data and sort by strike price
      const latestDate = options.reduce((latest, item) => {
        return new Date(item.date) > new Date(latest) ? item.date : latest;
      }, options[0].date);
      
      return options
        .filter(item => item.date === latestDate)
        .sort((a, b) => a.strike - b.strike);
    } catch (error) {
      console.error('Error getting option chain data from localStorage:', error);
      return [];
    }
  }
  
  // Market Data Methods with request deduplication
  public async getMarketData() {
    const cacheKey = 'market_data';
    try {
      // Try to get from cache first
      const cachedData = this.getCachedData<any>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Check if there's already a pending request for this data
      if (this.pendingRequests.has(cacheKey)) {
        return this.pendingRequests.get(cacheKey);
      }
      
      // Create a new request promise
      const requestPromise = (async () => {
        try {
          // If Dhan is connected, try to get data from there first
          if (this.isDhanConnected) {
            try {
              const marketStatus = await DhanApiService.getMarketStatus();
              if (marketStatus) {
                // Combine with NSE data for a complete picture
                const nseData = await NSEDataService.getMarketData();
                const combinedData = {
                  ...nseData,
                  marketStatus
                };
                
                // Cache but don't persist market summary data
                this.setCachedData(cacheKey, combinedData);
                return combinedData;
              }
            } catch (error) {
              console.error('Error fetching market data from Dhan:', error);
            }
          }
          
          // Fallback to NSE data
          const nseData = await NSEDataService.getMarketData();
          // Cache but don't persist market summary data
          this.setCachedData(cacheKey, nseData);
          return nseData;
        } finally {
          // Remove from pending requests when done
          this.pendingRequests.delete(cacheKey);
        }
      })();
      
      // Store the pending request
      this.pendingRequests.set(cacheKey, requestPromise);
      
      return requestPromise;
    } catch (error) {
      console.error('Error fetching market data:', error);
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }
  
  public async getSectorData() {
    const cacheKey = 'sector_data';
    try {
      // Try to get from cache first
      const cachedData = this.getCachedData<any>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Check if there's already a pending request for this data
      if (this.pendingRequests.has(cacheKey)) {
        return this.pendingRequests.get(cacheKey);
      }
      
      // Create a new request promise
      const requestPromise = (async () => {
        try {
          // Try to get from localStorage first
          const localData = LocalStorageService.getAll<SectorData>('sector_data');
          if (localData.length > 0) {
            return localData;
          }
          
          // Fallback to NSE data
          const data = await NSEDataService.getSectorData();
          // Cache and persist sector data
          this.setCachedData(cacheKey, data);
          return data;
        } finally {
          // Remove from pending requests when done
          this.pendingRequests.delete(cacheKey);
        }
      })();
      
      // Store the pending request
      this.pendingRequests.set(cacheKey, requestPromise);
      
      return requestPromise;
    } catch (error) {
      console.error('Error fetching sector data:', error);
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }
  
  public async getFIIDIIData(days: number = 10) {
    const cacheKey = `fii_dii_data_${days}`;
    try {
      // Try to get from cache first
      const cachedData = this.getCachedData<any>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Check if there's already a pending request for this data
      if (this.pendingRequests.has(cacheKey)) {
        return this.pendingRequests.get(cacheKey);
      }
      
      // Create a new request promise
      const requestPromise = (async () => {
        try {
          // Try to get from localStorage first
          const localData = LocalStorageService.getAll<FiiDiiData>('fii_dii_data')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, days);
          
          if (localData.length > 0) {
            return localData;
          }
          
          // Fallback to NSE data
          const data = await NSEDataService.getFIIDIIData(days);
          // Cache and persist FII/DII data
          this.setCachedData(cacheKey, data);
          return data;
        } finally {
          // Remove from pending requests when done
          this.pendingRequests.delete(cacheKey);
        }
      })();
      
      // Store the pending request
      this.pendingRequests.set(cacheKey, requestPromise);
      
      return requestPromise;
    } catch (error) {
      console.error('Error fetching FII/DII data:', error);
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }
  
  // Stock Data Methods
  public async getStockData(symbol: string) {
    const cacheKey = `stock_${symbol}`;
    try {
      // Try to get from cache first
      const cachedData = this.getCachedData<any>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Check if there's already a pending request for this data
      if (this.pendingRequests.has(cacheKey)) {
        return this.pendingRequests.get(cacheKey);
      }
      
      // Create a new request promise
      const requestPromise = (async () => {
        try {
          // Try to get from localStorage first
          const localData = this.getPersistedStockData(symbol);
          if (localData) {
            this.setCachedData(cacheKey, localData);
            return localData;
          }
          
          // If Dhan is connected, try to get real-time data
          if (this.isDhanConnected) {
            try {
              // Get scrip details from scrip master
              const scripMasterService = ScripMasterService.getInstance();
              const scripDetails = scripMasterService.getScripDetails(symbol);
              
              if (scripDetails) {
                // In a real implementation, we would use the token to get real-time data
                // For now, we'll fall back to NSE data
              }
            } catch (error) {
              console.error('Error fetching stock data from Dhan:', error);
            }
          }
          
          // Fallback to NSE data
          const data = await NSEDataService.getStockData(symbol);
          if (data) {
            this.setCachedData(cacheKey, data);
          }
          return data;
        } finally {
          // Remove from pending requests when done
          this.pendingRequests.delete(cacheKey);
        }
      })();
      
      // Store the pending request
      this.pendingRequests.set(cacheKey, requestPromise);
      
      return requestPromise;
    } catch (error) {
      console.error(`Error fetching stock data for ${symbol}:`, error);
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }
  
  public async getTopGainers(limit: number = 5) {
    const cacheKey = `top_gainers_${limit}`;
    try {
      // Try to get from cache first
      const cachedData = this.getCachedData<any>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Check if there's already a pending request for this data
      if (this.pendingRequests.has(cacheKey)) {
        return this.pendingRequests.get(cacheKey);
      }
      
      // Create a new request promise
      const requestPromise = (async () => {
        try {
          // Try to get from localStorage first
          const localData = LocalStorageService.getAll<StockData>('stock_data')
            .filter(stock => stock.changePercent > 0)
            .sort((a, b) => b.changePercent - a.changePercent)
            .slice(0, limit);
          
          if (localData.length >= limit) {
            return localData;
          }
          
          // Fallback to NSE data
          const data = await NSEDataService.getTopGainers(limit);
          this.setCachedData(cacheKey, data);
          return data;
        } finally {
          // Remove from pending requests when done
          this.pendingRequests.delete(cacheKey);
        }
      })();
      
      // Store the pending request
      this.pendingRequests.set(cacheKey, requestPromise);
      
      return requestPromise;
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }
  
  public async getTopLosers(limit: number = 5) {
    const cacheKey = `top_losers_${limit}`;
    try {
      // Try to get from cache first
      const cachedData = this.getCachedData<any>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Check if there's already a pending request for this data
      if (this.pendingRequests.has(cacheKey)) {
        return this.pendingRequests.get(cacheKey);
      }
      
      // Create a new request promise
      const requestPromise = (async () => {
        try {
          // Try to get from localStorage first
          const localData = LocalStorageService.getAll<StockData>('stock_data')
            .filter(stock => stock.changePercent < 0)
            .sort((a, b) => a.changePercent - b.changePercent)
            .slice(0, limit);
          
          if (localData.length >= limit) {
            return localData;
          }
          
          // Fallback to NSE data
          const data = await NSEDataService.getTopLosers(limit);
          this.setCachedData(cacheKey, data);
          return data;
        } finally {
          // Remove from pending requests when done
          this.pendingRequests.delete(cacheKey);
        }
      })();
      
      // Store the pending request
      this.pendingRequests.set(cacheKey, requestPromise);
      
      return requestPromise;
    } catch (error) {
      console.error('Error fetching top losers:', error);
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }
  
  // Option Chain Methods
  public async getOptionChainData(symbol: string, expiryDate?: string) {
    const cacheKey = `option_chain_${symbol}_${expiryDate || 'latest'}`;
    try {
      // Try to get from cache first - shorter expiry for option chain data
      const cachedData = this.getCachedData<any>(cacheKey);
      if (cachedData && (Date.now() - this.cache.get(cacheKey)!.timestamp) < 60000) { // 1 minute
        return cachedData;
      }
      
      // Check if there's already a pending request for this data
      if (this.pendingRequests.has(cacheKey)) {
        return this.pendingRequests.get(cacheKey);
      }
      
      // Create a new request promise
      const requestPromise = (async () => {
        try {
          // Try to get from localStorage first
          const localData = this.getPersistedOptionChainData(symbol, expiryDate);
          if (localData.length > 0) {
            // Convert to the expected format
            const formattedData = localData.map(item => ({
              strike: item.strike,
              ce_oi: item.ceOi,
              pe_oi: item.peOi,
              ce_volume: item.ceVolume,
              pe_volume: item.peVolume,
              ce_iv: item.ceIv,
              pe_iv: item.peIv
            }));
            
            this.setCachedData(cacheKey, formattedData);
            return formattedData;
          }
          
          // If Dhan is connected, try to get data from there first
          if (this.isDhanConnected) {
            try {
              const optionChain = await DhanApiService.getOptionChain(symbol, expiryDate || '');
              if (optionChain && optionChain.strikes) {
                const formattedData = optionChain.strikes.map((item: any) => ({
                  strike: item.strike,
                  ce_oi: item.callOption.oi,
                  pe_oi: item.putOption.oi,
                  ce_volume: item.callOption.volume,
                  pe_volume: item.putOption.volume,
                  ce_iv: item.callOption.iv,
                  pe_iv: item.putOption.iv
                }));
                
                this.setCachedData(cacheKey, formattedData);
                return formattedData;
              }
            } catch (error) {
              console.error('Error fetching option chain from Dhan:', error);
            }
          }
          
          // Fallback to NSE data
          const data = await NSEDataService.getOptionChainData(symbol, expiryDate);
          this.setCachedData(cacheKey, data);
          return data;
        } finally {
          // Remove from pending requests when done
          this.pendingRequests.delete(cacheKey);
        }
      })();
      
      // Store the pending request
      this.pendingRequests.set(cacheKey, requestPromise);
      
      return requestPromise;
    } catch (error) {
      console.error(`Error fetching option chain for ${symbol}:`, error);
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }
  
  public async getExpiryDates(symbol: string) {
    const cacheKey = `expiry_dates_${symbol}`;
    try {
      // Try to get from cache first
      const cachedData = this.getCachedData<string[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Check if there's already a pending request for this data
      if (this.pendingRequests.has(cacheKey)) {
        return this.pendingRequests.get(cacheKey);
      }
      
      // Create a new request promise
      const requestPromise = (async () => {
        try {
          // Try to get from localStorage first
          const options = LocalStorageService.getByField<OptionChainData>('option_chain_data', 'symbol', symbol);
          if (options.length > 0) {
            const dates = [...new Set(options.map(item => item.expiryDate))].sort();
            if (dates.length > 0) {
              this.setCachedData(cacheKey, dates);
              return dates;
            }
          }
          
          // If Dhan is connected, try to get data from there first
          if (this.isDhanConnected) {
            try {
              const dates = await DhanApiService.getExpiryDates(symbol);
              if (dates && dates.length > 0) {
                this.setCachedData(cacheKey, dates);
                return dates;
              }
            } catch (error) {
              console.error('Error fetching expiry dates from Dhan:', error);
            }
          }
          
          // Fallback to NSE data
          const dates = await NSEDataService.getExpiryDates(symbol);
          this.setCachedData(cacheKey, dates);
          return dates;
        } finally {
          // Remove from pending requests when done
          this.pendingRequests.delete(cacheKey);
        }
      })();
      
      // Store the pending request
      this.pendingRequests.set(cacheKey, requestPromise);
      
      return requestPromise;
    } catch (error) {
      console.error(`Error fetching expiry dates for ${symbol}:`, error);
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }
  
  // Search Methods
  public async searchStocks(query: string) {
    try {
      // Don't cache search results
      
      // First try to search in scrip master
      const scripMasterService = ScripMasterService.getInstance();
      const scripResults = scripMasterService.searchScrips(query, 10);
      
      if (scripResults.length > 0) {
        // Convert scrip results to stock data format
        return scripResults.map(scrip => ({
          symbol: scrip.symbol,
          name: scrip.name || scrip.symbol,
          price: 0,
          change: 0,
          changePercent: 0,
          volume: 0,
          exchange: scrip.exchange
        }));
      }
      
      // Try to search in localStorage
      const allStocks = LocalStorageService.getAll<StockData>('stock_data');
      const matchingStocks = allStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
        stock.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
      
      if (matchingStocks.length > 0) {
        return matchingStocks.map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          volume: stock.volume,
          exchange: 'NSE'
        }));
      }
      
      // Fallback to NSE search
      return await NSEDataService.searchStocks(query);
    } catch (error) {
      console.error(`Error searching stocks for "${query}":`, error);
      throw error;
    }
  }
  
  // User Preferences Methods
  public saveUserPreference(key: string, value: any): void {
    try {
      localStorage.setItem(`pref_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving user preference for ${key}:`, error);
    }
  }
  
  public getUserPreference<T>(key: string, defaultValue: T): T {
    try {
      const value = localStorage.getItem(`pref_${key}`);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error(`Error getting user preference for ${key}:`, error);
      return defaultValue;
    }
  }
  
  // Configuration Methods
  public getConfig<T>(key: string, defaultValue: T): T {
    try {
      const config = {
        // Default configuration values
        'chart.defaultTimeframe': '1D',
        'chart.defaultIndicators': ['RSI', 'MACD'],
        'app.theme': 'dark',
        'app.language': 'en',
        'notifications.enabled': true,
        'ai.suggestions': true
      };
      
      return (config as any)[key] || defaultValue;
    } catch (error) {
      console.error(`Error getting configuration for ${key}:`, error);
      return defaultValue;
    }
  }
  
  // Broker-specific methods
  public async getBrokerHoldings() {
    try {
      if (!this.isDhanConnected) {
        throw new Error('Broker not connected');
      }
      
      return await DhanApiService.getHoldings();
    } catch (error) {
      console.error('Error fetching broker holdings:', error);
      throw error;
    }
  }
  
  public async getBrokerPositions() {
    try {
      if (!this.isDhanConnected) {
        throw new Error('Broker not connected');
      }
      
      return await DhanApiService.getPositions();
    } catch (error) {
      console.error('Error fetching broker positions:', error);
      throw error;
    }
  }
  
  public async getBrokerOrders() {
    try {
      if (!this.isDhanConnected) {
        throw new Error('Broker not connected');
      }
      
      return await DhanApiService.getOrders();
    } catch (error) {
      console.error('Error fetching broker orders:', error);
      throw error;
    }
  }
  
  public async getBrokerFunds() {
    try {
      if (!this.isDhanConnected) {
        throw new Error('Broker not connected');
      }
      
      return await DhanApiService.getFunds();
    } catch (error) {
      console.error('Error fetching broker funds:', error);
      throw error;
    }
  }
  
  // Log order to localStorage
  public logOrder(userId: string, orderType: string, params: any, response?: any, error?: string, status: 'attempted' | 'completed' | 'failed' = 'completed'): void {
    try {
      LocalStorageService.create('order_logs', {
        userId,
        orderType,
        params,
        response,
        error,
        status
      });
    } catch (error) {
      console.error('Error logging order to localStorage:', error);
    }
  }
  
  // Log broker connection to localStorage
  public logBrokerConnection(userId: string, broker: string, clientId: string, status: 'connected' | 'disconnected' | 'failed' | 'error'): void {
    try {
      // Check if connection already exists
      const connections = LocalStorageService.getByField<any>('broker_connections', 'clientId', clientId)
        .filter(conn => conn.broker === broker && conn.userId === userId);
      
      if (connections.length > 0) {
        // Update existing connection
        LocalStorageService.update('broker_connections', connections[0].id, {
          status,
          lastConnectedAt: new Date().toISOString()
        });
      } else {
        // Create new connection
        LocalStorageService.create('broker_connections', {
          userId,
          broker,
          clientId,
          status,
          lastConnectedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error logging broker connection to localStorage:', error);
    }
  }
  
  // Get broker connections for a user
  public getBrokerConnections(userId: string): any[] {
    try {
      return LocalStorageService.getByField<any>('broker_connections', 'userId', userId)
        .sort((a, b) => new Date(b.lastConnectedAt).getTime() - new Date(a.lastConnectedAt).getTime());
    } catch (error) {
      console.error('Error getting broker connections from localStorage:', error);
      return [];
    }
  }
  
  // Get order logs for a user
  public getOrderLogs(userId: string, limit: number = 10): any[] {
    try {
      return LocalStorageService.getByField<any>('order_logs', 'userId', userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting order logs from localStorage:', error);
      return [];
    }
  }
  
  // Clear cache method for testing and manual refreshes
  public clearCache(): void {
    this.cache.clear();
    console.log('Data service cache cleared');
  }

  public async getChartData(symbol: string): Promise<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[]> {
    try {
      // Try to get data from MongoDB first
      const now = new Date();
      const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // last 30 days
      const cachedData = await this.marketDataService.getHistoricalData(symbol, from, now);
      
      if (cachedData && cachedData.length > 0) {
        console.log(`Using cached data for ${symbol} from MongoDB`);
        return cachedData.map(candle => ({
          time: candle.timestamp,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close
        }));
      }

      // If no cached data, fetch from Dhan API
      if (this.isDhanConnected) {
        const to = now.toISOString().split('T')[0];
        const fromStr = from.toISOString().split('T')[0];
        const data = await DhanApiService.getHistoricalData(symbol, 'NSE', '5m', fromStr, to);
        
        if (data && data.length > 0) {
          // Save to MongoDB
          await this.marketDataService.saveHistoricalData(symbol, data);
          
          return data.map(candle => ({
            time: candle.timestamp,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close
          }));
        }
      }
      
      throw new Error('No chart data available');
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  }
}