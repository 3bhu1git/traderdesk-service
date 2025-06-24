import React, { useEffect, useState } from 'react';
import { TrendingUp, Eye, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PaidUserGuard from '../components/Layout/PaidUserGuard';
import IntelligentSearch from '../components/TradingDesk/IntelligentSearch';
import AITradingAssistant from '../components/TradingDesk/AITradingAssistant';
import ChartAIAssistant from '../components/TradingDesk/ChartAIAssistant';
import BrokerPanel from '../components/TradingDesk/BrokerPanel';
import { DhanApiService, DhanCredentials } from '../services/dhanApiService';

const TradingDesk: React.FC = () => {
  const { user } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showChartAI, setShowChartAI] = useState(false);
  const [showBrokerPanel, setShowBrokerPanel] = useState(true);

  useEffect(() => {
    const storedCredentials = localStorage.getItem('dhanCredentials');
    if (storedCredentials) {
      try {
        const credentials: DhanCredentials = JSON.parse(storedCredentials);
        DhanApiService.initialize(credentials);
        DhanApiService.authenticate();
      } catch (error) {
        console.error('Error parsing Dhan credentials:', error);
        localStorage.removeItem('dhanCredentials');
      }
    }
  }, []);

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

          {/* Chart Area Placeholder */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-4 flex items-center justify-center">
              <span className="text-slate-400">Chart will appear here.</span>
            </div>
            {/* Option Chain Placeholder */}
            <div className="h-1/3 bg-slate-800 border-t border-slate-700 overflow-auto flex items-center justify-center">
              <span className="text-slate-500">Option chain will appear here.</span>
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