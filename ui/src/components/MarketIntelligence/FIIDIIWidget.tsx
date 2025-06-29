import React from 'react';
import { Building2, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';
import { FIIDIIActivity } from '../../services/marketIntelligenceService';

interface FIIDIIWidgetProps {
  data: FIIDIIActivity | null;
  isLoading?: boolean;
}

const FIIDIIWidget: React.FC<FIIDIIWidgetProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="professional-card p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-slate-600 rounded animate-pulse"></div>
            <div className="w-32 h-5 bg-slate-600 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="p-4 border border-slate-700/30 rounded-sm animate-pulse">
                <div className="w-16 h-4 bg-slate-600 rounded mb-2"></div>
                <div className="w-20 h-6 bg-slate-600 rounded"></div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex justify-between p-2 animate-pulse">
                <div className="w-16 h-3 bg-slate-600 rounded"></div>
                <div className="flex space-x-2">
                  <div className="w-12 h-3 bg-slate-600 rounded"></div>
                  <div className="w-12 h-3 bg-slate-600 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="professional-card p-6 border border-slate-700/50">
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">Unable to load FII/DII data</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return `₹${Math.abs(value).toLocaleString('en-IN')}Cr`;
  };

  const getFlowIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="w-4 h-4 text-green-400" />;
    if (value < 0) return <ArrowDownRight className="w-4 h-4 text-red-400" />;
    return <Target className="w-4 h-4 text-yellow-400" />;
  };

  const getFlowColor = (value: number) => {
    if (value > 0) return 'text-green-400 bg-green-900/20 border-green-700/30';
    if (value < 0) return 'text-red-400 bg-red-900/20 border-red-700/30';
    return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30';
  };

  const recentData = data.data.slice(-5); // Last 5 days

  return (
    <div className="professional-card p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Building2 className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-slate-200">FII/DII Activity</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`p-4 border rounded-sm ${getFlowColor(data.summary.fiiNetFlow)}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getFlowIcon(data.summary.fiiNetFlow)}
              <span className="text-sm font-semibold font-mono">FII NET FLOW</span>
            </div>
          </div>
          <div className="text-xl font-bold font-mono">
            {data.summary.fiiNetFlow >= 0 ? '+' : ''}{formatCurrency(data.summary.fiiNetFlow)}
          </div>
          <div className="text-xs opacity-75 font-mono">Last 10 days</div>
        </div>

        <div className={`p-4 border rounded-sm ${getFlowColor(data.summary.diiNetFlow)}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getFlowIcon(data.summary.diiNetFlow)}
              <span className="text-sm font-semibold font-mono">DII NET FLOW</span>
            </div>
          </div>
          <div className="text-xl font-bold font-mono">
            {data.summary.diiNetFlow >= 0 ? '+' : ''}{formatCurrency(data.summary.diiNetFlow)}
          </div>
          <div className="text-xs opacity-75 font-mono">Last 10 days</div>
        </div>
      </div>

      {/* Daily Activity Table */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-300 font-mono mb-3">RECENT ACTIVITY</h4>
        <div className="space-y-1">
          <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-slate-400 font-mono border-b border-slate-700/50 pb-2">
            <span>DATE</span>
            <span className="text-center">FII BUY</span>
            <span className="text-center">FII SELL</span>
            <span className="text-center">DII BUY</span>
            <span className="text-center">DII SELL</span>
          </div>
          
          {recentData.reverse().map((day, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 text-xs font-mono py-2 hover:bg-slate-800/30 rounded-sm">
              <span className="text-slate-300">
                {new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-center text-green-400">
                {formatCurrency(day.fii.buy)}
              </span>
              <span className="text-center text-red-400">
                {formatCurrency(day.fii.sell)}
              </span>
              <span className="text-center text-green-400">
                {formatCurrency(day.dii.buy)}
              </span>
              <span className="text-center text-red-400">
                {formatCurrency(day.dii.sell)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Net Flow Trends */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-sm p-3">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-semibold text-slate-200 font-mono">FII TREND</span>
            {getFlowIcon(data.summary.fiiNetFlow)}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {data.summary.fiiNetFlow > 0 
              ? 'FIIs have been net buyers, indicating positive foreign sentiment'
              : data.summary.fiiNetFlow < 0
              ? 'FIIs have been net sellers, suggesting cautious foreign outlook'
              : 'FII activity remains balanced with no clear directional bias'
            }
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-sm p-3">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-semibold text-slate-200 font-mono">DII TREND</span>
            {getFlowIcon(data.summary.diiNetFlow)}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {data.summary.diiNetFlow > 0 
              ? 'DIIs showing strong buying interest, supporting domestic confidence'
              : data.summary.diiNetFlow < 0
              ? 'DIIs reducing exposure, possibly due to valuation concerns'
              : 'DII activity shows neutral stance with balanced buying and selling'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default FIIDIIWidget;
