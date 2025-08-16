import React, { useState, useEffect } from 'react';
import { Filter, TrendingUp, Zap, BarChart, Download, Terminal, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PaidUserGuard from '../components/Layout/PaidUserGuard';
import ErrorBoundary from '../components/common/ErrorBoundary';
import StatusBar from '../components/common/StatusBar';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: string;
  volume?: string;
  pe?: number;
  score?: number;
  recommendation?: string;
  rsi?: number;
  signal?: string;
  oi?: string;
  pcr?: number;
  maxPain?: number;
  listingGains?: number;
  status?: string;
}

const Screener: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('screener_activeTab') || 'longterm';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [topGainers, setTopGainers] = useState<StockData[]>([]);
  const [topLosers, setTopLosers] = useState<StockData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const screenerTabs = [
    { id: 'longterm', label: 'Long Term', icon: TrendingUp },
    { id: 'ipo', label: 'IPO', icon: Zap },
    { id: 'fno', label: 'F&O', icon: BarChart },
    { id: 'shortterm', label: 'Short Term', icon: Filter }
  ];

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('screener_activeTab', activeTab);
  }, [activeTab]);

  const longtermStocks = topGainers.slice(0, 4).map(stock => ({
    ...stock,
    recommendation: 'Strong Buy'
  }));

  const ipoStocks = [
    {
      symbol: 'IDEAFORGE',
      name: 'ideaForge Technology Ltd',
      price: 685.40,
      change: 45.20,
      changePercent: 7.06,
      listingGains: 12.5,
      score: 72,
      status: 'Recently Listed'
    },
    {
      symbol: 'GODIGIT',
      name: 'Go Digit General Insurance',
      price: 312.80,
      change: -8.75,
      changePercent: -2.72,
      listingGains: -5.2,
      score: 68,
      status: 'New Listing'
    }
  ];

  const fnoStocks = [
    {
      symbol: 'NIFTY',
      name: 'Nifty 50 Index',
      price: 19745.30,
      change: 165.85,
      changePercent: 0.86,
      oi: '2.5Cr',
      pcr: 0.85,
      maxPain: 19700,
      score: 88
    },
    {
      symbol: 'BANKNIFTY',
      name: 'Bank Nifty Index',
      price: 44235.80,
      change: 285.45,
      changePercent: 0.65,
      oi: '1.8Cr',
      pcr: 0.92,
      maxPain: 44200,
      score: 81
    }
  ];

  const shorttermStocks = topGainers.slice(0, 2).map(stock => ({
    ...stock,
    signal: 'Momentum Buy'
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-900/30 text-green-400 border-green-700/50';
    if (score >= 70) return 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50';
    return 'bg-red-900/30 text-red-400 border-red-700/50';
  };

  const renderLongtermScreen = () => (
    <div className="space-y-3">
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="ml-3 text-slate-400 font-mono">LOADING DATA...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-32 flex-col">
          <Terminal className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-slate-400 font-mono text-center">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-3 py-1 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-300 hover:bg-slate-700/60 text-xs"
          >
            Dismiss
          </button>
        </div>
      ) : (
        longtermStocks.map((stock, index) => (
          <div key={index} className="professional-card p-4 hover:shadow-lg transition-all duration-200 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 font-mono">{stock.symbol}</h3>
                  <p className="text-sm text-slate-400 font-mono">{stock.name}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-slate-200 font-mono">₹{stock.price.toFixed(2)}</div>
                <div className={`text-sm font-medium font-mono ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%)
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
              <div>
                <span className="text-slate-500">Market Cap</span>
                <div className="font-semibold text-slate-300">{stock.marketCap}</div>
              </div>
              <div>
                <span className="text-slate-500">P/E Ratio</span>
                <div className="font-semibold text-slate-300">{stock.pe?.toFixed(1)}</div>
              </div>
              <div>
                <span className="text-slate-500">Score</span>
                <div className={`inline-block px-2 py-1 rounded-sm text-xs font-semibold border ${getScoreColor(stock.score || 0)}`}>
                  {stock.score}/100
                </div>
              </div>
              <div>
                <span className="text-slate-500">Recommendation</span>
                <div className="font-semibold text-green-400">{stock.recommendation}</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderIPOScreen = () => (
    <div className="space-y-3">
      {ipoStocks.map((stock, index) => (
        <div key={index} className="professional-card p-4 hover:shadow-lg transition-all duration-200 border border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-200 font-mono">{stock.symbol}</h3>
              <p className="text-sm text-slate-400 font-mono">{stock.name}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-slate-200 font-mono">₹{stock.price}</div>
              <div className={`text-sm font-medium font-mono ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%)
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm font-mono">
            <div>
              <span className="text-slate-500">Listing Gains</span>
              <div className={`font-semibold ${stock.listingGains >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stock.listingGains >= 0 ? '+' : ''}{stock.listingGains}%
              </div>
            </div>
            <div>
              <span className="text-slate-500">Score</span>
              <div className={`inline-block px-2 py-1 rounded-sm text-xs font-semibold border ${getScoreColor(stock.score)}`}>
                {stock.score}/100
              </div>
            </div>
            <div>
              <span className="text-slate-500">Status</span>
              <div className="font-semibold text-green-400">{stock.status}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFNOScreen = () => (
    <div className="space-y-3">
      {fnoStocks.map((stock, index) => (
        <div key={index} className="professional-card p-4 hover:shadow-lg transition-all duration-200 border border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-200 font-mono">{stock.symbol}</h3>
              <p className="text-sm text-slate-400 font-mono">{stock.name}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-slate-200 font-mono">{stock.price}</div>
              <div className={`text-sm font-medium font-mono ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%)
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
            <div>
              <span className="text-slate-500">Open Interest</span>
              <div className="font-semibold text-slate-300">{stock.oi}</div>
            </div>
            <div>
              <span className="text-slate-500">PCR</span>
              <div className="font-semibold text-slate-300">{stock.pcr}</div>
            </div>
            <div>
              <span className="text-slate-500">Max Pain</span>
              <div className="font-semibold text-slate-300">{stock.maxPain}</div>
            </div>
            <div>
              <span className="text-slate-500">Score</span>
              <div className={`inline-block px-2 py-1 rounded-sm text-xs font-semibold border ${getScoreColor(stock.score)}`}>
                {stock.score}/100
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderShorttermScreen = () => (
    <div className="space-y-3">
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="ml-3 text-slate-400 font-mono">LOADING DATA...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-32 flex-col">
          <Terminal className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-slate-400 font-mono text-center">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-3 py-1 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-300 hover:bg-slate-700/60 text-xs"
          >
            Dismiss
          </button>
        </div>
      ) : (
        shorttermStocks.map((stock, index) => (
          <div key={index} className="professional-card p-4 hover:shadow-lg transition-all duration-200 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-200 font-mono">{stock.symbol}</h3>
                <p className="text-sm text-slate-400 font-mono">{stock.name}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-slate-200 font-mono">₹{stock.price.toFixed(2)}</div>
                <div className={`text-sm font-medium font-mono ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%)
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
              <div>
                <span className="text-slate-500">Volume</span>
                <div className="font-semibold text-slate-300">{stock.volume}</div>
              </div>
              <div>
                <span className="text-slate-500">RSI</span>
                <div className="font-semibold text-slate-300">{stock.rsi?.toFixed(1)}</div>
              </div>
              <div>
                <span className="text-slate-500">Signal</span>
                <div className="font-semibold text-green-400">{stock.signal}</div>
              </div>
              <div>
                <span className="text-slate-500">Score</span>
                <div className={`inline-block px-2 py-1 rounded-sm text-xs font-semibold border ${getScoreColor(stock.score || 0)}`}>
                  {stock.score}/100
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'longterm': return renderLongtermScreen();
      case 'ipo': return renderIPOScreen();
      case 'fno': return renderFNOScreen();
      case 'shortterm': return renderShorttermScreen();
      default: return renderLongtermScreen();
    }
  };

  // Render status items for status bar
  const statusItems = [
    {
      label: "Screener",
      value: "ACTIVE",
      color: "text-green-400",
      icon: <Activity className="w-3 h-3" />,
      isAnimated: true
    },
    {
      label: "Stocks Scanned",
      value: "2,847",
      color: "text-green-400"
    },
    {
      label: "Last Scan",
      value: lastUpdated.toLocaleTimeString(),
      color: "text-green-400"
    }
  ];

  return (
    <PaidUserGuard isPaidUser={user?.isPaidUser || false} featureName="Stock Screener">
      <div className="p-4 md:p-6 h-full flex flex-col space-y-4">
        {/* Error Banner */}
        {error && (
          <div className="professional-card p-4 border border-red-700/50 bg-red-900/20">
            <div className="flex items-start space-x-3">
              <Terminal className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-red-400">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-300 text-sm mt-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Professional Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-200 font-mono">MARKET SCREENER</h1>
            <p className="text-slate-400 text-sm font-mono">Institutional-grade stock analysis platform</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-900/30 border border-green-700/50 rounded-sm">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm font-mono text-green-300">SCANNING</span>
            </div>
            <button 
              onClick={fetchStockData}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm hover:bg-slate-700/60 transition-all duration-200 text-sm"
            >
              <Download className={`w-4 h-4 text-green-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-slate-300 font-mono">REFRESH</span>
            </button>
          </div>
        </div>

        {/* Professional Tabs */}
        <div className="professional-card p-2 border border-slate-700/50">
          <div className="flex space-x-1">
            {screenerTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-sm font-medium transition-all duration-200 text-sm font-mono ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-600/20 to-green-500/20 text-green-300 border border-green-600/30'
                      : 'text-slate-400 hover:text-green-300 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content - Full width */}
        <div className="flex-1 overflow-y-auto professional-scroll">
          <ErrorBoundary>
            {renderActiveScreen()}
          </ErrorBoundary>
        </div>

        {/* Professional Status Bar */}
        <StatusBar items={statusItems} lastUpdated={lastUpdated} />
      </div>
    </PaidUserGuard>
  );
};

export default Screener;