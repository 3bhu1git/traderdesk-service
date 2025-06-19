import React from 'react';
import { useTrade } from '../../context/TradeContext';
import { Clock, TrendingUp, Target } from 'lucide-react';

interface StockHistoryProps {
  profile: string;
}

const StockHistory: React.FC<StockHistoryProps> = ({ profile }) => {
  const { getSuggestionsByProfile } = useTrade();
  const suggestions = getSuggestionsByProfile(profile);

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy': return 'text-green-600 bg-green-50';
      case 'sell': return 'text-red-600 bg-red-50';
      case 'hold': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Stock Suggestions History</h3>
      </div>

      <div className="space-y-4">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion) => (
            <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{suggestion.stockSymbol}</h4>
                  <p className="text-sm text-gray-600">{suggestion.stockName}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{suggestion.date.toLocaleDateString()}</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRecommendationColor(suggestion.recommendation)}`}>
                    {suggestion.recommendation.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Suggested Price:</span>
                  <div className="font-semibold">₹{suggestion.suggestedPrice}</div>
                </div>
                <div>
                  <span className="text-gray-600">Current Price:</span>
                  <div className="font-semibold">₹{suggestion.currentPrice}</div>
                </div>
                <div>
                  <span className="text-gray-600">Target:</span>
                  <div className="font-semibold text-green-600">₹{suggestion.targetPrice}</div>
                </div>
                <div>
                  <span className="text-gray-600">Stop Loss:</span>
                  <div className="font-semibold text-red-600">₹{suggestion.stopLoss}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <span className={`text-sm font-semibold ${getConfidenceColor(suggestion.confidence)}`}>
                    {suggestion.confidence}%
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Potential: {(((suggestion.targetPrice - suggestion.suggestedPrice) / suggestion.suggestedPrice) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No suggestions yet for this profile</p>
            <p className="text-sm text-gray-500 mt-1">Check back later for new recommendations</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockHistory;