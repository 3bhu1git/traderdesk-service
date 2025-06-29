import React from 'react';
import { TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import { SectorPerformance } from '../../services/marketIntelligenceService';

interface SectorPerformanceWidgetProps {
  data: SectorPerformance | null;
  isLoading?: boolean;
}

const SectorPerformanceWidget: React.FC<SectorPerformanceWidgetProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="professional-card p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-slate-600 rounded animate-pulse"></div>
            <div className="w-32 h-5 bg-slate-600 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-slate-700/30 rounded-sm animate-pulse">
              <div className="w-24 h-4 bg-slate-600 rounded"></div>
              <div className="w-16 h-4 bg-slate-600 rounded"></div>
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
          <RotateCcw className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">Unable to load sector performance</p>
        </div>
      </div>
    );
  }

  const getSectorDisplayName = (sectorName: string) => {
    return sectorName.replace('NIFTY ', '').replace(/\s+/g, ' ');
  };

  const getPerformanceColor = (changePercent: number) => {
    if (changePercent > 1) return 'text-green-400 bg-green-900/20 border-green-700/30';
    if (changePercent > 0) return 'text-green-300 bg-green-900/10 border-green-700/20';
    if (changePercent > -1) return 'text-red-300 bg-red-900/10 border-red-700/20';
    return 'text-red-400 bg-red-900/20 border-red-700/30';
  };

  const topSectors = data.sectors.slice(0, 8);
  const topGainers = data.sectors.filter(s => s.changePercent > 0).slice(0, 3);
  const topLosers = data.sectors.filter(s => s.changePercent < 0).slice(-3);

  return (
    <div className="professional-card p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <RotateCcw className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-200">Sector Performance</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </span>
      </div>

      {/* Top/Bottom Performers Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-900/10 border border-green-700/30 rounded-sm p-3">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-green-300 font-mono">TOP GAINERS</span>
          </div>
          <div className="space-y-1">
            {topGainers.map((sector, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-slate-300 font-mono">{getSectorDisplayName(sector.name)}</span>
                <span className="text-green-400 font-mono">+{sector.changePercent.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-red-900/10 border border-red-700/30 rounded-sm p-3">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-300 font-mono">TOP LOSERS</span>
          </div>
          <div className="space-y-1">
            {topLosers.map((sector, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-slate-300 font-mono">{getSectorDisplayName(sector.name)}</span>
                <span className="text-red-400 font-mono">{sector.changePercent.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Sectors List */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-300 font-mono mb-3">ALL SECTORS</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {topSectors.map((sector, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 border rounded-sm transition-colors hover:bg-slate-800/30 ${getPerformanceColor(sector.changePercent)}`}
            >
              <div className="flex-1">
                <div className="text-sm font-medium font-mono">
                  {getSectorDisplayName(sector.name)}
                </div>
                <div className="text-xs opacity-75 font-mono">
                  ₹{sector.value.toLocaleString('en-IN')}
                </div>
              </div>
              
              <div className="text-right">
                <div className={`flex items-center space-x-1 text-sm font-mono ${
                  sector.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {sector.changePercent >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {sector.changePercent >= 0 ? '+' : ''}{sector.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="text-xs opacity-75 font-mono">
                  {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Rotation Insight */}
      <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-sm">
        <div className="flex items-center space-x-2 mb-2">
          <RotateCcw className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-slate-200 font-mono">ROTATION INSIGHT</span>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          {topGainers.length > 0 && topLosers.length > 0
            ? `Money flow observed from ${getSectorDisplayName(topLosers[0].name)} to ${getSectorDisplayName(topGainers[0].name)} sector`
            : 'Balanced sector performance with no significant rotation'}
        </p>
      </div>
    </div>
  );
};

export default SectorPerformanceWidget;
