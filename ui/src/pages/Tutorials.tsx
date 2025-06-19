import React, { useState } from 'react';
import { PlayCircle, Clock, Star, Lock, Search, Filter } from 'lucide-react';

const Tutorials: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', label: 'All Tutorials' },
    { id: 'screener', label: 'Screener Tools' },
    { id: 'indicators', label: 'Indicators' },
    { id: 'trading-desk', label: 'Trading Desk' },
    { id: 'basics', label: 'Trading Basics' }
  ];

  const tutorials = [
    {
      id: 1,
      title: 'Getting Started with Long-term Screener',
      description: 'Learn how to use our advanced stock screener for long-term investment opportunities',
      duration: '8:45',
      difficulty: 'Beginner',
      category: 'screener',
      rating: 4.8,
      views: 2341,
      thumbnail: '/api/placeholder/300/200',
      isPremium: false,
      topics: ['Stock Selection', 'Fundamental Analysis', 'Screening Filters']
    },
    {
      id: 2,
      title: 'Mastering Supertrend AI Indicator',
      description: 'Complete guide to using our AI-powered Supertrend indicator for accurate trend detection',
      duration: '12:30',
      difficulty: 'Intermediate',
      category: 'indicators',
      rating: 4.9,
      views: 1876,
      thumbnail: '/api/placeholder/300/200',
      isPremium: true,
      topics: ['Technical Analysis', 'Trend Following', 'Signal Generation']
    },
    {
      id: 3,
      title: 'IPO Screening and Analysis',
      description: 'How to identify and analyze promising IPO opportunities using our specialized tools',
      duration: '10:15',
      difficulty: 'Intermediate',
      category: 'screener',
      rating: 4.7,
      views: 3210,
      thumbnail: '/api/placeholder/300/200',
      isPremium: true,
      topics: ['IPO Analysis', 'Listing Gains', 'Risk Assessment']
    },
    {
      id: 4,
      title: 'Understanding Option Chain and OI Analysis',
      description: 'Deep dive into option chain analysis and open interest interpretation',
      duration: '15:20',
      difficulty: 'Advanced',
      category: 'trading-desk',
      rating: 4.9,
      views: 1543,
      thumbnail: '/api/placeholder/300/200',
      isPremium: true,
      topics: ['Options Trading', 'Open Interest', 'Put-Call Ratio']
    },
    {
      id: 5,
      title: 'VIX Analysis for Market Timing',
      description: 'Learn to use VIX data for better market timing and risk management',
      duration: '9:35',
      difficulty: 'Intermediate',
      category: 'trading-desk',
      rating: 4.6,
      views: 2876,
      thumbnail: '/api/placeholder/300/200',
      isPremium: false,
      topics: ['Volatility Analysis', 'Market Timing', 'Risk Management']
    },
    {
      id: 6,
      title: 'Multi-Timeframe Demand & Supply Zones',
      description: 'Advanced technique for identifying institutional demand and supply zones',
      duration: '18:45',
      difficulty: 'Expert',
      category: 'indicators',
      rating: 4.9,
      views: 987,
      thumbnail: '/api/placeholder/300/200',
      isPremium: true,
      topics: ['Price Action', 'Support Resistance', 'Institutional Trading']
    },
    {
      id: 7,
      title: 'Risk Management Fundamentals',
      description: 'Essential risk management principles every trader should know',
      duration: '11:20',
      difficulty: 'Beginner',
      category: 'basics',
      rating: 4.8,
      views: 4321,
      thumbnail: '/api/placeholder/300/200',
      isPremium: false,
      topics: ['Position Sizing', 'Stop Loss', 'Portfolio Management']
    },
    {
      id: 8,
      title: 'Advanced F&O Screening Strategies',
      description: 'Professional strategies for screening F&O stocks and derivatives',
      duration: '14:30',
      difficulty: 'Advanced',
      category: 'screener',
      rating: 4.7,
      views: 1234,
      thumbnail: '/api/placeholder/300/200',
      isPremium: true,
      topics: ['Derivatives', 'Futures Trading', 'Options Strategies']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-900/30 text-green-400 border border-green-700/50';
      case 'Intermediate': return 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50';
      case 'Advanced': return 'bg-orange-900/30 text-orange-400 border border-orange-700/50';
      case 'Expert': return 'bg-red-900/30 text-red-400 border border-red-700/50';
      default: return 'bg-slate-800/50 text-slate-400 border border-slate-700/50';
    }
  };

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Video Tutorials</h1>
          <p className="text-slate-400 mt-1">Master our trading tools with step-by-step guides</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-sm">
          <PlayCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{tutorials.length} Videos</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="professional-card p-4 space-y-4 border border-slate-700/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tutorials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-sm text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-green-600/30 text-green-300 border border-green-600/50'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-green-300 border border-slate-700/50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutorials.map((tutorial) => (
          <div key={tutorial.id} className="professional-card overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer border border-slate-700/50">
            {/* Thumbnail */}
            <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
              <PlayCircle className="w-16 h-16 text-green-400 group-hover:text-green-300 transition-colors" />
              
              {/* Premium Badge */}
              {tutorial.isPremium && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-green-600 to-green-500 text-white px-2 py-1 rounded-sm text-xs font-semibold flex items-center space-x-1 border border-green-700/50">
                  <Lock className="w-3 h-3" />
                  <span>Premium</span>
                </div>
              )}

              {/* Duration */}
              <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2 py-1 rounded-sm text-xs font-medium flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{tutorial.duration}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-200 group-hover:text-green-300 transition-colors line-clamp-2">
                  {tutorial.title}
                </h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{tutorial.description}</p>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-sm">
                <div className={`px-2 py-1 rounded-sm text-xs font-medium ${getDifficultyColor(tutorial.difficulty)}`}>
                  {tutorial.difficulty}
                </div>
                <div className="flex items-center space-x-3 text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>{tutorial.rating}</span>
                  </div>
                  <span>{tutorial.views.toLocaleString()} views</span>
                </div>
              </div>

              {/* Topics */}
              <div>
                <div className="flex flex-wrap gap-1">
                  {tutorial.topics.slice(0, 3).map((topic, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-800/80 text-green-300 text-xs rounded-sm border border-green-700/30">
                      {topic}
                    </span>
                  ))}
                  {tutorial.topics.length > 3 && (
                    <span className="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded-sm border border-slate-700/50">
                      +{tutorial.topics.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Watch Button */}
              <button className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-2 px-4 rounded-sm font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 flex items-center justify-center space-x-2 transform group-hover:scale-105 shadow-lg hover:shadow-green-500/25">
                <PlayCircle className="w-4 h-4" />
                <span>Watch Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Learning Path Suggestion */}
      <div className="professional-card p-6 bg-slate-800/30 border border-slate-700/50">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center">
            <PlayCircle className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Suggested Learning Path</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span>Start with Trading Basics and Risk Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span>Learn to use Screener Tools effectively</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span>Master Trading Desk and Chart Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <span>Advanced Indicators and Strategies</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorials;