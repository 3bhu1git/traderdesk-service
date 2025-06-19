import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, Activity, BarChart3, Eye, Zap, RefreshCw, Clock, Bot, Loader, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PaidUserGuard from '../components/Layout/PaidUserGuard';
import IntelligentSearch from '../components/TradingDesk/IntelligentSearch';
import AITradingAssistant from '../components/TradingDesk/AITradingAssistant';
import OrderForm from '../components/TradingDesk/OrderForm';
import ChartAIAssistant from '../components/TradingDesk/ChartAIAssistant';
import BrokerPanel from '../components/TradingDesk/BrokerPanel';
import { DataService } from '../services/DataService';
import { DhanApiService, DhanCredentials } from '../services/dhanApiService';
import { ScripMasterService } from '../services/scripMasterService';
import { useDataFetching } from '../hooks/useDataFetching';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { LightweightChart } from '../components/LightweightChart';
import { MarketDataService } from '../services/marketDataService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface OptionChainItem {
  strike: number;
  ce_oi: number;
  pe_oi: number;
  ce_volume: number;
  pe_volume: number;
  ce_iv: number;
  pe_iv: number;
}

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const TradingDesk: React.FC = () => {
  const { user } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showChartAI, setShowChartAI] = useState(false);
  const [showBrokerPanel, setShowBrokerPanel] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | undefined>(undefined);
  
  // Use the data fetching hooks
  const dataService = DataService.getInstance();
  
  const { 
    data: optionChain
  } = useDataFetching<OptionChainItem[]>(
    () => dataService.getOptionChainData(selectedSymbol, selectedExpiry),
    [],
    300000 // 5 minutes refresh interval
  );
  
  const { 
    data: expiryDates
  } = useDataFetching<string[]>(
    () => dataService.getExpiryDates(selectedSymbol),
    []
  );
  
  const { 
    data: vixData
  } = useDataFetching<any>(
    async () => {
      const marketData = await dataService.getMarketData();
      const vix = marketData.vix;
      
      let interpretation = 'Low volatility, market stability expected';
      if (vix.value > 20) {
        interpretation = 'High volatility, caution advised';
      } else if (vix.value > 15) {
        interpretation = 'Moderate volatility expected';
      }
      
      return {
        current: vix.value,
        change: vix.change >= 0 ? `+${vix.change.toFixed(2)}` : vix.change.toFixed(2),
        changePercent: vix.changePercent >= 0 ? `+${vix.changePercent.toFixed(2)}%` : `${vix.changePercent.toFixed(2)}%`,
        interpretation
      };
    },
    {
      current: 11.25,
      change: '-0.85',
      changePercent: '-6.02%',
      interpretation: 'Low volatility, market stability expected'
    },
    300000 // 5 minutes refresh interval
  );

  const {
    data: chartData,
    isLoading: isLoadingChartData,
    error: chartDataError
  } = useDataFetching<ChartData[]>(
    () => dataService.getChartData(selectedSymbol),
    [],
    60000 // 1 minute refresh interval
  );
  
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [isDhanConnected, setIsDhanConnected] = useState(false);

  // Check if Dhan credentials exist in localStorage
  useEffect(() => {
    const storedCredentials = localStorage.getItem('dhanCredentials');
    if (storedCredentials) {
      try {
        const credentials: DhanCredentials = JSON.parse(storedCredentials);
        DhanApiService.initialize(credentials);
        DhanApiService.authenticate().then(success => {
          setIsDhanConnected(success);
        });
      } catch (error) {
        console.error('Error parsing Dhan credentials:', error);
        localStorage.removeItem('dhanCredentials');
      }
    }
    
    // Initialize scrip master
    const scripMasterService = ScripMasterService.getInstance();
    scripMasterService.loadScripMaster().catch(console.error);
  }, []);

  // Set selected expiry when expiry dates change
  useEffect(() => {
    if (expiryDates.length > 0 && !selectedExpiry) {
      setSelectedExpiry(expiryDates[0]);
    }
  }, [expiryDates, selectedExpiry]);

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  return (
    <PaidUserGuard isPaidUser={user?.isPaidUser || false} featureName="Trading Desk">
      <div className="flex h-screen bg-slate-900 text-white">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center space-x-4">
              <IntelligentSearch onSymbolSelect={handleSymbolSelect} selectedSymbol={selectedSymbol} />
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-lg font-semibold">{selectedSymbol}</span>
                {currentPrice && (
                  <span className="text-green-400">₹{currentPrice.toFixed(2)}</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Bot className="w-5 h-5" />
                <span>AI Assistant</span>
              </button>
              <button
                onClick={() => setShowChartAI(!showChartAI)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                <Eye className="w-5 h-5" />
                <span>Chart AI</span>
              </button>
            </div>
          </div>

          {/* Chart Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-4">
              {isLoadingChartData ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : chartDataError ? (
                <div className="flex items-center justify-center h-full text-red-500">
                  <AlertTriangle className="w-8 h-8 mr-2" />
                  <span>Error loading chart data</span>
                </div>
              ) : (
                <LightweightChart 
                  symbol={selectedSymbol}
                  data={chartData || []}
                />
              )}
            </div>

            {/* Option Chain */}
            <div className="h-1/3 bg-slate-800 border-t border-slate-700 overflow-auto">
              {/* Option chain content */}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        {showBrokerPanel && (
          <div className="w-80 bg-slate-800 border-l border-slate-700 overflow-y-auto">
            <BrokerPanel symbol={selectedSymbol} />
          </div>
        )}

        {/* AI Assistant Modal */}
        {showAIAssistant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <AITradingAssistant onSymbolSelect={handleSymbolSelect} />
          </div>
        )}

        {/* Chart AI Modal */}
        {showChartAI && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <ChartAIAssistant symbol={selectedSymbol} onClose={() => setShowChartAI(false)} />
          </div>
        )}
      </div>
    </PaidUserGuard>
  );
};

export default TradingDesk;