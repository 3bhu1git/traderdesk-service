import React from 'react';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { TopMovers } from '../../services/marketIntelligenceService';

interface TopMoversWidgetProps {
  data: TopMovers | null;
  isLoading?: boolean;
}

const TopMoversWidget: React.FC<TopMoversWidgetProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="professional-card p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-slate-600 rounded animate-pulse"></div>
            <div className="w-32 h-5 bg-slate-600 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, sectionIndex) => (
            <div key={sectionIndex} className="space-y-3">
              <div className="w-24 h-4 bg-slate-600 rounded animate-pulse"></div>
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-slate-700/30 rounded-sm animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-600 rounded"></div>
                    <div>
                      <div className="w-16 h-3 bg-slate-600 rounded mb-1"></div>
                      <div className="w-12 h-3 bg-slate-600 rounded"></div>
                    </div>
                  </div>
                  <div className="w-16 h-4 bg-slate-600 rounded"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="professional-card p-6 border border-slate-700/50">
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">Unable to load top movers data</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 10000000) {
      return `${(volume / 10000000).toFixed(1)}Cr`;
    } else if (volume >= 100000) {
      return `${(volume / 100000).toFixed(1)}L`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const StockCard = ({ stock, index, type }: { stock: any; index: number; type: 'gainer' | 'loser' }) => (
    <div className={`flex items-center justify-between p-3 border rounded-sm transition-colors hover:bg-slate-800/30 ${
      type === 'gainer' 
        ? 'border-green-700/30 bg-green-900/10' 
        : 'border-red-700/30 bg-red-900/10'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold text-white ${
          type === 'gainer' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {index + 1}
        </div>
        <div>
          <div className="text-sm font-medium text-slate-200 font-mono">{stock.symbol}</div>
          <div className="text-xs text-slate-400 font-mono">{formatPrice(stock.price)}</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className={`flex items-center space-x-1 text-sm font-mono ${
          type === 'gainer' ? 'text-green-400' : 'text-red-400'
        }`}>
          {type === 'gainer' ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>
            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </span>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Vol: {formatVolume(stock.volume)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="professional-card p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Star className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-slate-200">Top Movers</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <h4 className="text-sm font-semibold text-green-300 font-mono">TOP GAINERS</h4>
          </div>
          
          {data.gainers.length > 0 ? (
            <div className="space-y-2">
              {data.gainers.map((stock, index) => (
                <StockCard key={stock.symbol} stock={stock} index={index} type="gainer" />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-slate-400 font-mono">
              No significant gainers today
            </div>
          )}
        </div>

        {/* Top Losers */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <h4 className="text-sm font-semibold text-red-300 font-mono">TOP LOSERS</h4>
          </div>
          
          {data.losers.length > 0 ? (
            <div className="space-y-2">
              {data.losers.map((stock, index) => (
                <StockCard key={stock.symbol} stock={stock} index={index} type="loser" />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-slate-400 font-mono">
              No significant losers today
            </div>
          )}
        </div>
      </div>

      {/* Market Breadth Insight */}
      {data.gainers.length > 0 && data.losers.length > 0 && (
        <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-slate-200 font-mono">MARKET BREADTH</span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            {data.gainers.length > data.losers.length 
              ? 'Positive market breadth with more gainers than losers, indicating broad-based buying interest'
              : data.losers.length > data.gainers.length
              ? 'Negative market breadth with more losers than gainers, suggesting broad-based selling pressure'
              : 'Balanced market breadth with equal distribution of gainers and losers'
            }
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
              <span className="text-xs text-slate-400 font-mono">Gainers: {data.gainers.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
              <span className="text-xs text-slate-400 font-mono">Losers: {data.losers.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopMoversWidget;
