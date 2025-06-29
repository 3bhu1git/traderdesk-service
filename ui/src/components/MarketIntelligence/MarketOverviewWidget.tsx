import React from 'react';
import { TrendingUp, TrendingDown, Activity, Globe, BarChart3, Zap } from 'lucide-react';
import { MarketOverview } from '../../services/marketIntelligenceService';

interface MarketOverviewWidgetProps {
  data: MarketOverview | null;
  isLoading?: boolean;
}

const MarketOverviewWidget: React.FC<MarketOverviewWidgetProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="professional-card p-4 border border-slate-700/50 animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-slate-600 rounded"></div>
                <div className="w-16 h-3 bg-slate-600 rounded"></div>
              </div>
              <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
            </div>
            <div className="w-24 h-6 bg-slate-600 rounded mb-1"></div>
            <div className="w-20 h-4 bg-slate-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <Globe className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <p className="text-slate-400">Unable to load market overview</p>
      </div>
    );
  }

  const getIndexIcon = (symbol: string) => {
    switch (symbol) {
      case 'NIFTY 50':
        return <Globe className="w-4 h-4 text-green-400" />;
      case 'NIFTY BANK':
        return <BarChart3 className="w-4 h-4 text-blue-400" />;
      case 'SENSEX':
        return <BarChart3 className="w-4 h-4 text-purple-400" />;
      case 'INDIA VIX':
        return <Zap className="w-4 h-4 text-orange-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Market Status Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            data.marketStatus.isOpen ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <span className={`text-sm font-mono font-semibold ${
            data.marketStatus.isOpen ? 'text-green-300' : 'text-red-300'
          }`}>
            MARKET {data.marketStatus.status}
          </span>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </span>
      </div>

      {/* Indices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.indices.map((index) => (
          <div key={index.symbol} className="professional-card p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getIndexIcon(index.symbol)}
                <span className="text-xs text-slate-400 font-mono">{index.symbol}</span>
              </div>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                data.marketStatus.isOpen ? 'bg-green-400' : 'bg-slate-600'
              }`}></div>
            </div>
            
            <div className="text-xl font-bold text-slate-200 font-mono mb-1">
              {index.value.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            
            <div className={`flex items-center space-x-1 text-sm font-mono ${
              index.change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {index.change >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} 
                ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Next Market Open (if market is closed) */}
      {!data.marketStatus.isOpen && data.marketStatus.nextOpen && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-sm p-3">
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Activity className="w-4 h-4" />
            <span className="font-mono">
              Next market open: {new Date(data.marketStatus.nextOpen).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketOverviewWidget;
