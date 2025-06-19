import React, { useState } from 'react';
import { TrendingUp, Zap, Layers, Target, Lock, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PaidUserGuard from '../components/Layout/PaidUserGuard';

const Indicators: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('intraday');

  const indicatorCategories = [
    { id: 'intraday', label: 'Intraday', icon: Zap },
    { id: 'magic', label: 'Magic Levels', icon: Target },
    { id: 'mtf', label: 'MTF Demand & Supply', icon: Layers },
    { id: 'liquidity', label: 'Institute Liquidity', icon: TrendingUp }
  ];

  const intradayIndicators = [
    {
      name: 'Supertrend AI',
      description: 'AI-powered trend following indicator with dynamic parameters',
      accuracy: '87%',
      timeframes: ['1m', '5m', '15m'],
      signals: 'Buy/Sell arrows',
      premium: false,
      image: '/api/placeholder/300/200'
    },
    {
      name: 'VWAP Bands',
      description: 'Volume-weighted average price with dynamic bands',
      accuracy: '82%',
      timeframes: ['5m', '15m', '1h'],
      signals: 'Support/Resistance levels',
      premium: true,
      image: '/api/placeholder/300/200'
    },
    {
      name: 'Momentum Oscillator',
      description: 'Custom momentum indicator for scalping opportunities',
      accuracy: '79%',
      timeframes: ['1m', '3m', '5m'],
      signals: 'Overbought/Oversold zones',
      premium: true,
      image: '/api/placeholder/300/200'
    }
  ];

  const magicLevelIndicators = [
    {
      name: 'Fibonacci Confluence',
      description: 'Advanced Fibonacci levels with confluence zones',
      accuracy: '91%',
      timeframes: ['Daily', 'Weekly'],
      signals: 'Key reversal levels',
      premium: true,
      image: '/api/placeholder/300/200'
    },
    {
      name: 'Support Resistance Pro',
      description: 'Dynamic support and resistance with strength rating',
      accuracy: '85%',
      timeframes: ['4h', 'Daily'],
      signals: 'Breakout alerts',
      premium: true,
      image: '/api/placeholder/300/200'
    }
  ];

  const mtfIndicators = [
    {
      name: 'Multi-Timeframe Demand',
      description: 'Institutional demand zones across multiple timeframes',
      accuracy: '89%',
      timeframes: ['15m', '1h', '4h', 'Daily'],
      signals: 'Demand/Supply zones',
      premium: true,
      image: '/api/placeholder/300/200'
    },
    {
      name: 'Order Flow Analysis',
      description: 'Real-time order flow and imbalance detection',
      accuracy: '93%',
      timeframes: ['5m', '15m', '1h'],
      signals: 'Imbalance alerts',
      premium: true,
      image: '/api/placeholder/300/200'
    }
  ];

  const liquidityIndicators = [
    {
      name: 'Smart Money Index',
      description: 'Track institutional money flow and positioning',
      accuracy: '88%',
      timeframes: ['1h', '4h', 'Daily'],
      signals: 'Smart money alerts',
      premium: true,
      image: '/api/placeholder/300/200'
    },
    {
      name: 'Liquidity Pools',
      description: 'Identify high liquidity zones and potential reversals',
      accuracy: '86%',
      timeframes: ['15m', '1h', '4h'],
      signals: 'Liquidity sweeps',
      premium: true,
      image: '/api/placeholder/300/200'
    }
  ];

  const getIndicators = () => {
    switch (selectedCategory) {
      case 'intraday': return intradayIndicators;
      case 'magic': return magicLevelIndicators;
      case 'mtf': return mtfIndicators;
      case 'liquidity': return liquidityIndicators;
      default: return intradayIndicators;
    }
  };

  return (
    <PaidUserGuard isPaidUser={user?.isPaidUser || false} featureName="Premium Indicators">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header with proper mobile padding */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Premium Indicators</h1>
            <p className="text-gray-600 mt-1 text-base md:text-lg">Professional trading indicators and analysis tools</p>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Premium Active</span>
          </div>
        </div>

        {/* Mobile-Optimized Category Tabs - Standardized with Screener style */}
        <div className="professional-card p-2 border border-slate-700/50">
          <div className="flex space-x-1">
            {indicatorCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-sm font-medium transition-all duration-200 text-sm font-mono ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-green-600/20 to-green-500/20 text-green-300 border border-green-600/30'
                      : 'text-slate-400 hover:text-green-300 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Indicators Grid - Adjusted layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {getIndicators().map((indicator, index) => (
            <div key={index} className="professional-card p-4 md:p-6 hover:shadow-lg transition-all duration-200 group border border-slate-700/50">
              {/* Preview Image */}
              <div className="relative mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 h-32 md:h-40 flex items-center justify-center">
                <TrendingUp className="w-12 h-12 md:w-16 md:h-16 text-green-400" />
                {indicator.premium && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Premium</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 group-hover:text-green-300 transition-colors">
                    {indicator.name}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">{indicator.description}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-400">Accuracy</span>
                    <span className="font-semibold text-green-400">{indicator.accuracy}</span>
                  </div>
                </div>

                {/* Timeframes */}
                <div>
                  <span className="text-xs text-slate-500 block mb-2">Timeframes</span>
                  <div className="flex flex-wrap gap-1">
                    {indicator.timeframes.map((tf, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-800/80 text-green-300 text-xs rounded-sm border border-green-700/30">
                        {tf}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Signals */}
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Signal Type</span>
                  <span className="text-sm font-medium text-slate-300">{indicator.signals}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-3">
                  <button className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-2 px-4 rounded-sm text-sm font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 flex items-center justify-center space-x-1">
                    <Play className="w-3 h-3" />
                    <span>Use Now</span>
                  </button>
                  <button className="px-4 py-2 border border-slate-700/50 text-slate-300 rounded-sm text-sm font-medium hover:bg-slate-800/50 transition-colors">
                    Info
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Usage Guide */}
        <div className="professional-card p-4 md:p-6 bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-200 mb-2">How to Use Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                <div>
                  <h4 className="font-medium mb-1 text-green-400">1. Select Timeframe</h4>
                  <p>Choose appropriate timeframe based on your trading style</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-green-400">2. Configure Settings</h4>
                  <p>Adjust parameters according to market conditions</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-green-400">3. Monitor Signals</h4>
                  <p>Watch for buy/sell signals and confirmation</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-green-400">4. Risk Management</h4>
                  <p>Always use stop-loss and position sizing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PaidUserGuard>
  );
};

export default Indicators;