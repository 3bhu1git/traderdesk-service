import React from 'react';
import { Eye, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { InstitutionalActivity } from '../../services/marketIntelligenceService';

interface InstitutionalInsightsWidgetProps {
  data: InstitutionalActivity | null;
  isLoading?: boolean;
}

const InstitutionalInsightsWidget: React.FC<InstitutionalInsightsWidgetProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="professional-card p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-slate-600 rounded animate-pulse"></div>
            <div className="w-40 h-5 bg-slate-600 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="p-4 border border-slate-700/30 rounded-sm animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-slate-600 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-slate-600 rounded"></div>
                  <div className="w-1/2 h-3 bg-slate-600 rounded"></div>
                  <div className="w-1/4 h-3 bg-slate-600 rounded"></div>
                </div>
              </div>
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
          <Eye className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">Unable to load institutional insights</p>
        </div>
      </div>
    );
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'neutral':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-green-700/30 bg-green-900/10';
      case 'negative':
        return 'border-red-700/30 bg-red-900/10';
      case 'neutral':
        return 'border-yellow-700/30 bg-yellow-900/10';
      default:
        return 'border-blue-700/30 bg-blue-900/10';
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'FII_ACTIVITY':
        return 'FII Activity';
      case 'DII_ACTIVITY':
        return 'DII Activity';
      case 'SECTOR_ROTATION':
        return 'Sector Rotation';
      case 'BLOCK_DEALS':
        return 'Block Deals';
      case 'BULK_DEALS':
        return 'Bulk Deals';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FII_ACTIVITY':
      case 'DII_ACTIVITY':
        return '🏛️';
      case 'SECTOR_ROTATION':
        return '🔄';
      case 'BLOCK_DEALS':
      case 'BULK_DEALS':
        return '📊';
      default:
        return '💡';
    }
  };

  return (
    <div className="professional-card p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Eye className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-slate-200">Institutional Insights</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </span>
      </div>

      <div className="space-y-4">
        {data.insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 border rounded-sm transition-colors hover:bg-slate-800/30 ${getSentimentColor(insight.sentiment)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getSentimentIcon(insight.sentiment)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">{getTypeIcon(insight.type)}</span>
                    <span className="text-sm font-semibold text-slate-200 font-mono">
                      {getTypeDisplayName(insight.type)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {insight.timeframe}
                  </span>
                </div>
                
                <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                  {insight.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {insight.amount && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-slate-500 font-mono">Amount:</span>
                        <span className={`text-xs font-mono font-semibold ${
                          insight.sentiment === 'positive' ? 'text-green-400' : 
                          insight.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {insight.amount}
                        </span>
                      </div>
                    )}
                    
                    {insight.sectors && insight.sectors.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-slate-500 font-mono">Sectors:</span>
                        <div className="flex space-x-1">
                          {insight.sectors.slice(0, 2).map((sector, sectorIndex) => (
                            <span
                              key={sectorIndex}
                              className="text-xs bg-slate-700/50 px-2 py-1 rounded-sm font-mono"
                            >
                              {sector}
                            </span>
                          ))}
                          {insight.sectors.length > 2 && (
                            <span className="text-xs text-slate-500 font-mono">
                              +{insight.sectors.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`px-2 py-1 border rounded-sm text-xs font-mono font-semibold ${
                    insight.sentiment === 'positive' ? 'border-green-700/50 text-green-400' :
                    insight.sentiment === 'negative' ? 'border-red-700/50 text-red-400' :
                    'border-yellow-700/50 text-yellow-400'
                  }`}>
                    {insight.sentiment.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights Summary */}
      <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-sm">
        <div className="flex items-center space-x-2 mb-2">
          <Eye className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-slate-200 font-mono">AI ANALYSIS</span>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          {data.insights.filter(i => i.sentiment === 'positive').length > 
           data.insights.filter(i => i.sentiment === 'negative').length
            ? 'Overall institutional sentiment appears positive with more buying activities than selling'
            : data.insights.filter(i => i.sentiment === 'negative').length >
              data.insights.filter(i => i.sentiment === 'positive').length
            ? 'Mixed institutional sentiment with some caution observed in recent activities'
            : 'Balanced institutional sentiment with neutral market positioning'
          }
        </p>
        
        <div className="flex items-center space-x-4 mt-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs text-slate-400 font-mono">
              Positive: {data.insights.filter(i => i.sentiment === 'positive').length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-slate-400 font-mono">
              Neutral: {data.insights.filter(i => i.sentiment === 'neutral').length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-3 h-3 text-red-400" />
            <span className="text-xs text-slate-400 font-mono">
              Negative: {data.insights.filter(i => i.sentiment === 'negative').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalInsightsWidget;
