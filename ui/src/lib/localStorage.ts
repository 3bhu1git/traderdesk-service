/**
 * LocalStorageService - A utility class for managing localStorage operations
 * Replaces Supabase database operations with localStorage implementation
 */

// Types for localStorage data
export interface LocalStorageUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  subscriptionExpiry: string; // ISO date string
  registrationDate: string; // ISO date string
  loginMethod: 'phone' | 'google';
  isPaidUser: boolean;
  deviceId?: string;
  sessionId?: string;
  sessionExpiry?: string; // ISO date string
}

export interface LocalStorageTrade {
  id: string;
  userId: string;
  stockSymbol: string;
  stockName: string;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  tradeType: 'buy' | 'sell';
  status: 'open' | 'closed';
  profit?: number;
  percentage?: number;
  entryDate: string; // ISO date string
  exitDate?: string; // ISO date string
  recommendation: string;
  isSuccessful?: boolean;
}

export interface LocalStorageStockSuggestion {
  id: string;
  stockSymbol: string;
  stockName: string;
  suggestedPrice: number;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  recommendation: 'buy' | 'sell' | 'hold';
  confidence: number;
  date: string; // ISO date string
  profile: 'longterm' | 'shortterm' | 'ipo' | 'fno';
}

export interface LocalStorageBrokerToken {
  id: string;
  user_id: string;
  broker: string;
  client_id: string;
  access_token: string;
  refresh_token?: string;
  expires_at: string; // ISO date string
  created_at: string; // ISO date string
}

export interface LocalStorageOrderLog {
  id?: string;
  user_id: string;
  order_type: string;
  params: any;
  response?: any;
  error?: string;
  status: 'attempted' | 'completed' | 'failed';
  created_at: string; // ISO date string
}

export interface LocalStorageBrokerConnection {
  id: string;
  user_id: string;
  broker: string;
  client_id: string;
  status: string;
  last_connected_at?: string; // ISO date string
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface FiiDiiData {
  id: string;
  date: string;
  fiiSell: number;
  fiiBuy: number;
  diiSell: number;
  diiBuy: number;
  fiiNet: number;
  diiNet: number;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

export interface SectorData {
  id: string;
  name: string;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  date: string;
  price: number;
  high52w: number;
  low52w: number;
  pe: number;
  momentum: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  strength: number;
  rotation: 'inflow' | 'outflow' | 'neutral';
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

export interface StockData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  high: number;
  low: number;
  open: number;
  close?: number;
  prevClose: number;
  date: string;
  isLive: boolean;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

export interface OptionChainData {
  id: string;
  symbol: string;
  expiryDate: string;
  strike: number;
  ceOi: number;
  peOi: number;
  ceVolume: number;
  peVolume: number;
  ceIv: number;
  peIv: number;
  date: string;
  time: string;
  isLive: boolean;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

export class LocalStorageService {
  // Storage keys
  private static readonly KEYS = {
    USERS: 'traderdesk_users',
    TRADES: 'traderdesk_trades',
    STOCK_SUGGESTIONS: 'traderdesk_stock_suggestions',
    BROKER_TOKENS: 'traderdesk_broker_tokens',
    ORDER_LOGS: 'traderdesk_order_logs',
    BROKER_CONNECTIONS: 'traderdesk_broker_connections',
    FII_DII_DATA: 'traderdesk_fii_dii_data',
    SECTOR_DATA: 'traderdesk_sector_data',
    STOCK_DATA: 'traderdesk_stock_data',
    OPTION_CHAIN_DATA: 'traderdesk_option_chain_data',
  };

  // Initialize localStorage with sample data if empty
  public static initializeStorage(): void {
    try {
      // Initialize users if not exists
      if (!localStorage.getItem(this.KEYS.USERS)) {
        localStorage.setItem(this.KEYS.USERS, JSON.stringify([]));
      }

      // Initialize trades if not exists
      if (!localStorage.getItem(this.KEYS.TRADES)) {
        const sampleTrades: LocalStorageTrade[] = [
          {
            id: '1',
            userId: '1',
            stockSymbol: 'RELIANCE',
            stockName: 'Reliance Industries Ltd',
            entryPrice: 2400,
            exitPrice: 2700,
            quantity: 100,
            tradeType: 'buy',
            status: 'closed',
            profit: 30000,
            percentage: 12.5,
            entryDate: new Date('2024-01-10').toISOString(),
            exitDate: new Date('2024-01-25').toISOString(),
            recommendation: 'Strong Buy based on technical analysis',
            isSuccessful: true
          },
          {
            id: '2',
            userId: '1',
            stockSymbol: 'TCS',
            stockName: 'Tata Consultancy Services',
            entryPrice: 3600,
            exitPrice: 3450,
            quantity: 50,
            tradeType: 'buy',
            status: 'closed',
            profit: -7500,
            percentage: -4.17,
            entryDate: new Date('2024-01-15').toISOString(),
            exitDate: new Date('2024-01-20').toISOString(),
            recommendation: 'Buy on dip - technical bounce expected',
            isSuccessful: false
          }
        ];
        localStorage.setItem(this.KEYS.TRADES, JSON.stringify(sampleTrades));
      }

      // Initialize stock suggestions if not exists
      if (!localStorage.getItem(this.KEYS.STOCK_SUGGESTIONS)) {
        const sampleSuggestions: LocalStorageStockSuggestion[] = [
          {
            id: '1',
            stockSymbol: 'HDFCBANK',
            stockName: 'HDFC Bank Limited',
            suggestedPrice: 1620,
            currentPrice: 1628,
            targetPrice: 1750,
            stopLoss: 1580,
            recommendation: 'buy',
            confidence: 85,
            date: new Date().toISOString(),
            profile: 'longterm'
          },
          {
            id: '2',
            stockSymbol: 'ADANIPORTS',
            stockName: 'Adani Ports & SEZ Ltd',
            suggestedPrice: 780,
            currentPrice: 785,
            targetPrice: 850,
            stopLoss: 750,
            recommendation: 'buy',
            confidence: 78,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            profile: 'shortterm'
          }
        ];
        localStorage.setItem(this.KEYS.STOCK_SUGGESTIONS, JSON.stringify(sampleSuggestions));
      }

      // Initialize broker tokens if not exists
      if (!localStorage.getItem(this.KEYS.BROKER_TOKENS)) {
        localStorage.setItem(this.KEYS.BROKER_TOKENS, JSON.stringify([]));
      }

      // Initialize order logs if not exists
      if (!localStorage.getItem(this.KEYS.ORDER_LOGS)) {
        localStorage.setItem(this.KEYS.ORDER_LOGS, JSON.stringify([]));
      }

      // Initialize broker connections if not exists
      if (!localStorage.getItem(this.KEYS.BROKER_CONNECTIONS)) {
        localStorage.setItem(this.KEYS.BROKER_CONNECTIONS, JSON.stringify([]));
      }

      // Initialize FII/DII data if not exists
      if (!localStorage.getItem(this.KEYS.FII_DII_DATA)) {
        const sampleFiiDiiData: FiiDiiData[] = this.generateSampleFiiDiiData(14);
        localStorage.setItem(this.KEYS.FII_DII_DATA, JSON.stringify(sampleFiiDiiData));
      }

      // Initialize sector data if not exists
      if (!localStorage.getItem(this.KEYS.SECTOR_DATA)) {
        const sampleSectorData: SectorData[] = this.generateSampleSectorData();
        localStorage.setItem(this.KEYS.SECTOR_DATA, JSON.stringify(sampleSectorData));
      }

      // Initialize stock data if not exists
      if (!localStorage.getItem(this.KEYS.STOCK_DATA)) {
        const sampleStockData: StockData[] = this.generateSampleStockData();
        localStorage.setItem(this.KEYS.STOCK_DATA, JSON.stringify(sampleStockData));
      }

      // Initialize option chain data if not exists
      if (!localStorage.getItem(this.KEYS.OPTION_CHAIN_DATA)) {
        const sampleOptionChainData: OptionChainData[] = this.generateSampleOptionChainData();
        localStorage.setItem(this.KEYS.OPTION_CHAIN_DATA, JSON.stringify(sampleOptionChainData));
      }

      console.log('LocalStorage initialized with sample data');
    } catch (error) {
      console.error('Error initializing localStorage:', error);
    }
  }

  // Generic CRUD operations
  public static getAll<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(this.KEYS[key as keyof typeof this.KEYS]);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting data from localStorage for key ${key}:`, error);
      return [];
    }
  }

  public static getById<T extends { id: string }>(key: string, id: string): T | null {
    try {
      const items = this.getAll<T>(key);
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error(`Error getting item by ID from localStorage for key ${key}:`, error);
      return null;
    }
  }

  public static getByField<T>(key: string, field: keyof T, value: any): T[] {
    try {
      const items = this.getAll<T>(key);
      return items.filter(item => (item as any)[field] === value);
    } catch (error) {
      console.error(`Error getting items by field from localStorage for key ${key}:`, error);
      return [];
    }
  }

  public static create<T>(key: string, data: Omit<T, 'id'>): T {
    try {
      const items = this.getAll<T>(key);
      const newItem = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as T;
      
      items.push(newItem);
      localStorage.setItem(this.KEYS[key as keyof typeof this.KEYS], JSON.stringify(items));
      
      return newItem;
    } catch (error) {
      console.error(`Error creating item in localStorage for key ${key}:`, error);
      throw error;
    }
  }

  public static update<T extends { id: string }>(key: string, id: string, data: Partial<T>): T | null {
    try {
      const items = this.getAll<T>(key);
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) return null;
      
      const updatedItem = {
        ...items[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      items[index] = updatedItem;
      localStorage.setItem(this.KEYS[key as keyof typeof this.KEYS], JSON.stringify(items));
      
      return updatedItem;
    } catch (error) {
      console.error(`Error updating item in localStorage for key ${key}:`, error);
      return null;
    }
  }

  public static delete(key: string, id: string): boolean {
    try {
      const items = this.getAll<{ id: string }>(key);
      const updatedItems = items.filter(item => item.id !== id);
      
      if (updatedItems.length === items.length) return false;
      
      localStorage.setItem(this.KEYS[key as keyof typeof this.KEYS], JSON.stringify(updatedItems));
      return true;
    } catch (error) {
      console.error(`Error deleting item from localStorage for key ${key}:`, error);
      return false;
    }
  }

  // Broker token methods
  public static getBrokerTokens(): LocalStorageBrokerToken[] {
    try {
      const tokens = localStorage.getItem(this.KEYS.BROKER_TOKENS);
      return tokens ? JSON.parse(tokens) : [];
    } catch (error) {
      console.error('Error getting broker tokens from localStorage:', error);
      return [];
    }
  }

  public static getBrokerTokensByUserId(userId: string): LocalStorageBrokerToken[] {
    try {
      const tokens = this.getBrokerTokens();
      return tokens.filter(token => token.user_id === userId);
    } catch (error) {
      console.error(`Error getting broker tokens for user ${userId} from localStorage:`, error);
      return [];
    }
  }

  public static saveBrokerToken(token: LocalStorageBrokerToken): void {
    try {
      const tokens = this.getBrokerTokens();
      const existingTokenIndex = tokens.findIndex(t => t.id === token.id);
      
      if (existingTokenIndex >= 0) {
        // Update existing token
        tokens[existingTokenIndex] = token;
      } else {
        // Add new token
        tokens.push({
          ...token,
          id: token.id || crypto.randomUUID()
        });
      }
      
      localStorage.setItem(this.KEYS.BROKER_TOKENS, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error saving broker token to localStorage:', error);
    }
  }

  // Order log methods
  public static getOrderLogs(userId?: string): LocalStorageOrderLog[] {
    try {
      const logs = localStorage.getItem(this.KEYS.ORDER_LOGS);
      const allLogs = logs ? JSON.parse(logs) : [];
      
      if (userId) {
        return allLogs.filter((log: LocalStorageOrderLog) => log.user_id === userId);
      }
      
      return allLogs;
    } catch (error) {
      console.error('Error getting order logs from localStorage:', error);
      return [];
    }
  }

  public static logOrder(orderLog: LocalStorageOrderLog): void {
    try {
      const logs = this.getOrderLogs();
      
      // Add new log with generated ID
      logs.push({
        ...orderLog,
        id: orderLog.id || crypto.randomUUID()
      });
      
      localStorage.setItem(this.KEYS.ORDER_LOGS, JSON.stringify(logs));
    } catch (error) {
      console.error('Error logging order to localStorage:', error);
    }
  }

  // Broker connection methods
  public static getBrokerConnections(): LocalStorageBrokerConnection[] {
    try {
      const connections = localStorage.getItem(this.KEYS.BROKER_CONNECTIONS);
      return connections ? JSON.parse(connections) : [];
    } catch (error) {
      console.error('Error getting broker connections from localStorage:', error);
      return [];
    }
  }

  public static getBrokerConnectionsByUserId(userId: string): LocalStorageBrokerConnection[] {
    try {
      const connections = this.getBrokerConnections();
      return connections.filter(connection => connection.user_id === userId);
    } catch (error) {
      console.error(`Error getting broker connections for user ${userId} from localStorage:`, error);
      return [];
    }
  }

  public static saveBrokerConnection(connection: LocalStorageBrokerConnection): void {
    try {
      const connections = this.getBrokerConnections();
      
      // Check for existing connection with same user_id, broker, and client_id
      const existingConnectionIndex = connections.findIndex(c => 
        c.user_id === connection.user_id && 
        c.broker === connection.broker && 
        c.client_id === connection.client_id
      );
      
      if (existingConnectionIndex >= 0) {
        // Update existing connection
        connections[existingConnectionIndex] = {
          ...connections[existingConnectionIndex],
          ...connection,
          updated_at: new Date().toISOString()
        };
      } else {
        // Add new connection
        connections.push({
          ...connection,
          id: connection.id || crypto.randomUUID(),
          created_at: connection.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      localStorage.setItem(this.KEYS.BROKER_CONNECTIONS, JSON.stringify(connections));
    } catch (error) {
      console.error('Error saving broker connection to localStorage:', error);
    }
  }

  // Sample data generators
  private static generateSampleFiiDiiData(days: number): FiiDiiData[] {
    const data: FiiDiiData[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const fiiBuy = 6000 + Math.floor(Math.random() * 4000);
      const fiiSell = 5500 + Math.floor(Math.random() * 4000);
      const diiBuy = 7000 + Math.floor(Math.random() * 3000);
      const diiSell = 4000 + Math.floor(Math.random() * 3000);
      
      data.push({
        id: crypto.randomUUID(),
        date: date.toISOString().split('T')[0],
        fiiBuy,
        fiiSell,
        diiBuy,
        diiSell,
        fiiNet: fiiBuy - fiiSell,
        diiNet: diiBuy - diiSell,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return data;
  }

  private static generateSampleSectorData(): SectorData[] {
    const sectors = [
      'Nifty Bank',
      'Nifty IT',
      'Nifty Auto',
      'Nifty Pharma',
      'Nifty FMCG',
      'Nifty Energy',
      'Nifty Metal',
      'Nifty Realty',
      'Nifty Media',
      'Nifty Consumer Durables'
    ];
    
    return sectors.map(name => {
      const change = Math.random() * 400 - 200;
      const changePercent = change / 100;
      
      return {
        id: crypto.randomUUID(),
        name,
        change,
        changePercent,
        volume: `${(Math.random() * 2.5 + 0.5).toFixed(1)}B`,
        marketCap: `${(Math.random() * 15 + 1).toFixed(1)}L Cr`,
        date: new Date().toISOString().split('T')[0],
        price: 10000 + Math.random() * 40000,
        high52w: 12000 + Math.random() * 40000,
        low52w: 8000 + Math.random() * 30000,
        pe: 10 + Math.random() * 30,
        momentum: Math.random() > 0.6 ? 'buy' : Math.random() > 0.3 ? 'hold' : 'sell',
        strength: Math.floor(Math.random() * 100),
        rotation: Math.random() > 0.6 ? 'inflow' : Math.random() > 0.3 ? 'neutral' : 'outflow',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
  }

  private static generateSampleStockData(): StockData[] {
    const stocks = [
      { symbol: 'NIFTY', name: 'Nifty 50 Index', basePrice: 19485.30 },
      { symbol: 'BANKNIFTY', name: 'Bank Nifty Index', basePrice: 44235.80 },
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', basePrice: 2485.30 },
      { symbol: 'TCS', name: 'Tata Consultancy Services', basePrice: 3645.75 },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', basePrice: 1628.90 },
      { symbol: 'INFY', name: 'Infosys Limited', basePrice: 1456.25 },
      { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ Ltd', basePrice: 785.60 },
      { symbol: 'JSWSTEEL', name: 'JSW Steel Limited', basePrice: 725.30 }
    ];
    
    return stocks.map(stock => {
      const change = (Math.random() * 40) - 20;
      const changePercent = (change / stock.basePrice) * 100;
      
      return {
        id: crypto.randomUUID(),
        symbol: stock.symbol,
        name: stock.name,
        price: stock.basePrice,
        change,
        changePercent,
        volume: Math.floor(Math.random() * 10000000),
        marketCap: stock.symbol === 'NIFTY' || stock.symbol === 'BANKNIFTY' ? undefined : Math.floor(Math.random() * 2000000),
        peRatio: stock.symbol === 'NIFTY' || stock.symbol === 'BANKNIFTY' ? undefined : Math.random() * 30 + 10,
        high: stock.basePrice + Math.random() * 20,
        low: stock.basePrice - Math.random() * 20,
        open: stock.basePrice - Math.random() * 10,
        close: undefined,
        prevClose: stock.basePrice - Math.random() * 5,
        date: new Date().toISOString().split('T')[0],
        isLive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
  }

  private static generateSampleOptionChainData(): OptionChainData[] {
    const symbols = ['NIFTY', 'BANKNIFTY'];
    const expiryDates = [
      new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
      new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
      new Date(new Date().setDate(new Date().getDate() + 21)).toISOString().split('T')[0]
    ];
    
    const data: OptionChainData[] = [];
    
    symbols.forEach(symbol => {
      const basePrice = symbol === 'NIFTY' ? 19485.30 : 44235.80;
      const strikeDiff = symbol === 'NIFTY' ? 50 : 100;
      
      expiryDates.forEach(expiryDate => {
        for (let i = -5; i <= 5; i++) {
          const strike = Math.round(basePrice + (i * strikeDiff));
          
          data.push({
            id: crypto.randomUUID(),
            symbol,
            expiryDate,
            strike,
            ceOi: Math.floor(Math.random() * 5000000),
            peOi: Math.floor(Math.random() * 5000000),
            ceVolume: Math.floor(Math.random() * 1000000),
            peVolume: Math.floor(Math.random() * 1000000),
            ceIv: Math.random() * 10 + 10,
            peIv: Math.random() * 10 + 10,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0],
            isLive: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      });
    });
    
    return data;
  }

  // Utility methods
  public static clearStorage(): void {
    try {
      localStorage.removeItem(this.KEYS.USERS);
      localStorage.removeItem(this.KEYS.TRADES);
      localStorage.removeItem(this.KEYS.STOCK_SUGGESTIONS);
      localStorage.removeItem(this.KEYS.BROKER_TOKENS);
      localStorage.removeItem(this.KEYS.ORDER_LOGS);
      localStorage.removeItem(this.KEYS.BROKER_CONNECTIONS);
      localStorage.removeItem(this.KEYS.FII_DII_DATA);
      localStorage.removeItem(this.KEYS.SECTOR_DATA);
      localStorage.removeItem(this.KEYS.STOCK_DATA);
      localStorage.removeItem(this.KEYS.OPTION_CHAIN_DATA);
      
      console.log('LocalStorage cleared');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  public static getStorageSize(): number {
    try {
      let totalSize = 0;
      
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage.getItem(key)?.length || 0;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error getting localStorage size:', error);
      return 0;
    }
  }
}

// Initialize localStorage with sample data
LocalStorageService.initializeStorage();