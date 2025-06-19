import React, { useState, useEffect } from 'react';
import { useTrade } from '../context/TradeContext';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Calendar, Filter, BarChart3, Target, RefreshCw, AlertCircle } from 'lucide-react';
import ErrorBoundary from '../components/common/ErrorBoundary';

const Performance: React.FC = () => {
  const { trades, getTradesByUser } = useTrade();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<'all' | 'successful' | 'unsuccessful'>(() => {
    return localStorage.getItem('performance_filterStatus') as any || 'all';
  });
  const [dateRange, setDateRange] = useState(() => {
    return localStorage.getItem('performance_dateRange') || 'all';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem('performance_filterStatus', filterStatus);
  }, [filterStatus]);

  useEffect(() => {
    localStorage.setItem('performance_dateRange', dateRange);
  }, [dateRange]);

  const userTrades = user ? getTradesByUser(user.id) : trades;

  // Apply date filter
  const getDateFilteredTrades = () => {
    const now = new Date();
    
    return userTrades.filter(trade => {
      if (dateRange === 'all') return true;
      
      const tradeDate = trade.entryDate;
      const diffDays = Math.floor((now.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateRange) {
        case '7d': return diffDays <= 7;
        case '30d': return diffDays <= 30;
        case '90d': return diffDays <= 90;
        default: return true;
      }
    });
  };

  const dateFilteredTrades = getDateFilteredTrades();

  const filteredTrades = dateFilteredTrades.filter(trade => {
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'successful' && trade.isSuccessful) ||
      (filterStatus === 'unsuccessful' && trade.isSuccessful === false);
    
    return statusMatch;
  });

  const successfulTrades = filteredTrades.filter(trade => trade.isSuccessful);
  const unsuccessfulTrades = filteredTrades.filter(trade => trade.isSuccessful === false);
  
  const totalProfit = filteredTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
  const winRate = filteredTrades.length > 0 ? (successfulTrades.length / filteredTrades.length) * 100 : 0;

  const getStatusColor = (isSuccessful?: boolean) => {
    if (isSuccessful === true) return 'text-green-400 bg-green-900/30 border border-green-700/50';
    if (isSuccessful === false) return 'text-red-400 bg-red-900/30 border border-red-700/50';
    return 'text-yellow-400 bg-yellow-900/30 border border-yellow-700/50';
  };

  const getStatusText = (isSuccessful?: boolean) => {
    if (isSuccessful === true) return 'Successful';
    if (isSuccessful === false) return 'Unsuccessful';
    return 'Open';
  };

  const refreshData = () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="professional-card p-4 border border-red-700/50 bg-red-900/20">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
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
      
      {/* Header with proper mobile padding */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-200 font-mono">PERFORMANCE</h1>
          <p className="text-slate-400 mt-1 text-base md:text-lg font-mono">Track your trading performance and recommendations</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-900/30 border border-green-700/50 rounded-sm">
            <BarChart3 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-mono text-green-300">{filteredTrades.length} Trades</span>
          </div>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm hover:bg-slate-700/60 transition-all duration-200 text-sm"
          >
            <RefreshCw className={`w-4 h-4 text-green-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-slate-300 font-mono">REFRESH</span>
          </button>
        </div>
      </div>

      {/* Performance Summary */}
      <ErrorBoundary>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="professional-card p-4 md:p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-900/30 rounded-xl flex items-center justify-center border border-green-700/50">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
              <span className="text-sm text-green-400 font-medium font-mono">Total P&L</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-slate-200 mb-1 font-mono">
              ₹{totalProfit.toLocaleString()}
            </div>
            <div className={`text-sm ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'} font-mono`}>
              {totalProfit >= 0 ? '+' : ''}{((totalProfit / 100000) * 100).toFixed(2)}%
            </div>
          </div>

          <div className="professional-card p-4 md:p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-900/30 rounded-xl flex items-center justify-center border border-blue-700/50">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
              <span className="text-sm text-blue-400 font-medium font-mono">Win Rate</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-slate-200 mb-1 font-mono">
              {winRate.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-400 font-mono">
              {successfulTrades.length}/{filteredTrades.length} trades
            </div>
          </div>

          <div className="professional-card p-4 md:p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-900/30 rounded-xl flex items-center justify-center border border-green-700/50">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
              <span className="text-sm text-green-400 font-medium font-mono">Successful</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-green-400 mb-1 font-mono">
              {successfulTrades.length}
            </div>
            <div className="text-sm text-slate-400 font-mono">
              Avg: ₹{successfulTrades.length > 0 ? (successfulTrades.reduce((sum, t) => sum + (t.profit || 0), 0) / successfulTrades.length).toLocaleString() : '0'}
            </div>
          </div>

          <div className="professional-card p-4 md:p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-red-900/30 rounded-xl flex items-center justify-center border border-red-700/50">
                <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
              </div>
              <span className="text-sm text-red-400 font-medium font-mono">Unsuccessful</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-red-400 mb-1 font-mono">
              {unsuccessfulTrades.length}
            </div>
            <div className="text-sm text-slate-400 font-mono">
              Avg: ₹{unsuccessfulTrades.length > 0 ? (unsuccessfulTrades.reduce((sum, t) => sum + (t.profit || 0), 0) / unsuccessfulTrades.length).toLocaleString() : '0'}
            </div>
          </div>
        </div>
      </ErrorBoundary>

      {/* Filters */}
      <ErrorBoundary>
        <div className="professional-card p-4 border border-slate-700/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-mono"
              >
                <option value="all">All Trades</option>
                <option value="successful">Successful Only</option>
                <option value="unsuccessful">Unsuccessful Only</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-mono"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 3 Months</option>
              </select>
            </div>
          </div>
        </div>
      </ErrorBoundary>

      {/* Mobile-Responsive Trades List */}
      <ErrorBoundary>
        <div className="professional-card overflow-hidden border border-slate-700/50">
          <div className="p-4 md:p-6 border-b border-slate-700/50">
            <h2 className="text-lg md:text-xl font-semibold text-slate-200 font-mono">TRADE HISTORY</h2>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                <p className="text-slate-400 font-mono">LOADING TRADES...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile: Card Layout */}
              <div className="md:hidden">
                {filteredTrades.map((trade) => (
                  <div key={trade.id} className="p-4 border-b border-slate-700/50 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-base font-medium text-slate-200 font-mono">{trade.stockSymbol}</div>
                        <div className="text-sm text-slate-400 font-mono">{trade.stockName}</div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-sm ${getStatusColor(trade.isSuccessful)}`}>
                        {getStatusText(trade.isSuccessful)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <span className="text-slate-400 font-mono">Entry:</span>
                        <div className="font-medium text-slate-300 font-mono">₹{trade.entryPrice}</div>
                        <div className="text-xs text-slate-500 font-mono">{trade.entryDate.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 font-mono">Exit:</span>
                        <div className="font-medium text-slate-300 font-mono">{trade.exitPrice ? `₹${trade.exitPrice}` : '-'}</div>
                        <div className="text-xs text-slate-500 font-mono">{trade.exitDate ? trade.exitDate.toLocaleDateString() : '-'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium ${
                          (trade.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        } font-mono`}>
                          {trade.profit ? `₹${trade.profit.toLocaleString()}` : '-'}
                        </div>
                        <div className={`text-xs ${
                          (trade.percentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        } font-mono`}>
                          {trade.percentage ? `${trade.percentage >= 0 ? '+' : ''}${trade.percentage}%` : '-'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-slate-400 line-clamp-2 font-mono">
                      {trade.recommendation}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">Entry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">Exit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">P&L</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredTrades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-slate-800/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-slate-200 font-mono">{trade.stockSymbol}</div>
                            <div className="text-sm text-slate-400 font-mono">{trade.stockName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300 font-mono">₹{trade.entryPrice}</div>
                          <div className="text-sm text-slate-500 font-mono">{trade.entryDate.toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300 font-mono">
                            {trade.exitPrice ? `₹${trade.exitPrice}` : '-'}
                          </div>
                          <div className="text-sm text-slate-500 font-mono">
                            {trade.exitDate ? trade.exitDate.toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            (trade.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                          } font-mono`}>
                            {trade.profit ? `₹${trade.profit.toLocaleString()}` : '-'}
                          </div>
                          <div className={`text-sm ${
                            (trade.percentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                          } font-mono`}>
                            {trade.percentage ? `${trade.percentage >= 0 ? '+' : ''}${trade.percentage}%` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-sm ${getStatusColor(trade.isSuccessful)} font-mono`}>
                            {getStatusText(trade.isSuccessful)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-300 max-w-xs truncate font-mono" title={trade.recommendation}>
                            {trade.recommendation}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </ErrorBoundary>

      {filteredTrades.length === 0 && !isLoading && (
        <div className="professional-card p-8 md:p-12 text-center border border-slate-700/50">
          <BarChart3 className="w-12 h-12 md:w-16 md:h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2 font-mono">NO TRADES FOUND</h3>
          <p className="text-slate-400 font-mono">Start trading to see your performance here</p>
        </div>
      )}
    </div>
  );
};

export default Performance;