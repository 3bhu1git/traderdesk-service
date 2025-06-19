export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  subscriptionExpiry: Date;
  registrationDate: Date;
  loginMethod: 'phone' | 'google';
  isPaidUser: boolean;
  deviceId?: string;
  sessionId?: string;
  sessionExpiry?: Date;
}

export interface Admin {
  id: string;
  username: string;
  email: string;
}

export interface Announcement {
  id: string;
  userId: string;
  userName: string;
  stockSymbol: string;
  profit: number;
  percentage: number;
  date: Date;
  tradeType: 'buy' | 'sell';
}

export interface Trade {
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
  entryDate: Date;
  exitDate?: Date;
  recommendation: string;
  isSuccessful?: boolean;
}

export interface StockSuggestion {
  id: string;
  stockSymbol: string;
  stockName: string;
  suggestedPrice: number;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  recommendation: 'buy' | 'sell' | 'hold';
  confidence: number;
  date: Date;
  profile: 'longterm' | 'shortterm' | 'ipo' | 'fno';
}

export interface MenuContent {
  id: string;
  title: string;
  description: string;
  features: string[];
  isActive: boolean;
}