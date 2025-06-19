import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Trade, StockSuggestion } from '../types';

interface TradeContextType {
  trades: Trade[];
  stockSuggestions: StockSuggestion[];
  addTrade: (trade: Omit<Trade, 'id'>) => void;
  updateTrade: (tradeId: string, updates: Partial<Trade>) => void;
  addStockSuggestion: (suggestion: Omit<StockSuggestion, 'id'>) => void;
  getTradesByUser: (userId: string) => Trade[];
  getSuggestionsByProfile: (profile: string) => StockSuggestion[];
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const useTrade = () => {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTrade must be used within a TradeProvider');
  }
  return context;
};

interface TradeProviderProps {
  children: ReactNode;
}

export const TradeProvider: React.FC<TradeProviderProps> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([
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
      entryDate: new Date('2024-01-10'),
      exitDate: new Date('2024-01-25'),
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
      entryDate: new Date('2024-01-15'),
      exitDate: new Date('2024-01-20'),
      recommendation: 'Buy on dip - technical bounce expected',
      isSuccessful: false
    }
  ]);

  const [stockSuggestions, setStockSuggestions] = useState<StockSuggestion[]>([
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
      date: new Date(),
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
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      profile: 'shortterm'
    }
  ]);

  const addTrade = (trade: Omit<Trade, 'id'>) => {
    const newTrade = {
      ...trade,
      id: Date.now().toString()
    };
    setTrades(prev => [newTrade, ...prev]);
  };

  const updateTrade = (tradeId: string, updates: Partial<Trade>) => {
    setTrades(prev => prev.map(trade =>
      trade.id === tradeId ? { ...trade, ...updates } : trade
    ));
  };

  const addStockSuggestion = (suggestion: Omit<StockSuggestion, 'id'>) => {
    const newSuggestion = {
      ...suggestion,
      id: Date.now().toString()
    };
    setStockSuggestions(prev => [newSuggestion, ...prev]);
  };

  const getTradesByUser = (userId: string) => {
    return trades.filter(trade => trade.userId === userId);
  };

  const getSuggestionsByProfile = (profile: string) => {
    return stockSuggestions.filter(suggestion => suggestion.profile === profile);
  };

  const value: TradeContextType = {
    trades,
    stockSuggestions,
    addTrade,
    updateTrade,
    addStockSuggestion,
    getTradesByUser,
    getSuggestionsByProfile
  };

  return (
    <TradeContext.Provider value={value}>
      {children}
    </TradeContext.Provider>
  );
};