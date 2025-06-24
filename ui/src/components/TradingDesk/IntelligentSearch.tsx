import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, BarChart3, Clock, Loader } from 'lucide-react';

interface IntelligentSearchProps {
  onSymbolSelect: (symbol: string) => void;
  selectedSymbol: string;
}

const IntelligentSearch: React.FC<IntelligentSearchProps> = ({ onSymbolSelect, selectedSymbol }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSymbols] = useState<string[]>([
    'NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 
    'ADANIPORTS', 'JSWSTEEL', 'TATAMOTORS', 'ICICIBANK', 'SBIN', 'AXISBANK'
  ]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);
  
  // Save recent searches to localStorage
  const saveRecentSearch = (symbol: string) => {
    const updatedSearches = [
      symbol,
      ...recentSearches.filter(s => s !== symbol).slice(0, 4)
    ];
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // Handle search input change with debounce
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        // No scrip master, just return empty or static results
        setSearchResults([]);
        setShowResults(true);
      } catch (error) {
        setSearchResults([]);
        setShowResults(true);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSymbolSelect = (symbol: string) => {
    onSymbolSelect(symbol);
    setSearchTerm('');
    setShowResults(false);
    saveRecentSearch(symbol);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="professional-card p-4 border border-slate-700/50" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search symbols (e.g., NIFTY, RELIANCE, TCS)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="w-full pl-10 pr-10 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 backdrop-blur-sm text-base font-mono"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900/95 backdrop-blur-xl rounded-sm shadow-xl border border-slate-700/50 z-20">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="w-5 h-5 text-green-400 animate-spin" />
                  <p className="text-slate-400 font-mono">Searching...</p>
                </div>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto professional-scroll">
                {searchTerm.length < 2 ? (
                  <>
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center space-x-2 px-2 py-1">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span className="text-xs text-slate-500 font-mono">RECENT SEARCHES</span>
                        </div>
                        <div className="mt-1">
                          {recentSearches.map((symbol) => (
                            <div 
                              key={symbol}
                              onClick={() => handleSymbolSelect(symbol)}
                              className="px-4 py-2 hover:bg-slate-800/50 cursor-pointer flex items-center justify-between"
                            >
                              <span className="text-slate-200 font-mono">{symbol}</span>
                              <span className="text-xs text-green-400 font-mono">NSE</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Popular Symbols */}
                    <div className="p-2 border-t border-slate-700/50">
                      <div className="flex items-center space-x-2 px-2 py-1">
                        <TrendingUp className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-500 font-mono">POPULAR SYMBOLS</span>
                      </div>
                      <div className="mt-1 grid grid-cols-2 md:grid-cols-3 gap-1">
                        {popularSymbols.map((symbol) => (
                          <div 
                            key={symbol}
                            onClick={() => handleSymbolSelect(symbol)}
                            className={`px-3 py-2 rounded-sm cursor-pointer flex items-center space-x-2 ${
                              selectedSymbol === symbol
                                ? 'bg-green-600/30 text-green-300 border border-green-600/50'
                                : 'hover:bg-slate-800/50 text-slate-300'
                            }`}
                          >
                            <BarChart3 className="w-3 h-3 text-slate-400" />
                            <span className="font-mono">{symbol}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : searchResults.length > 0 ? (
                  <div>
                    {searchResults.map((result) => (
                      <div 
                        key={result.symbol}
                        onClick={() => handleSymbolSelect(result.symbol)}
                        className="px-4 py-3 hover:bg-slate-800/50 cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <span className="text-slate-200 font-mono">{result.symbol}</span>
                          <p className="text-xs text-slate-400 font-mono">{result.name}</p>
                        </div>
                        <span className="text-xs text-green-400 font-mono">{result.exchange || 'NSE'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400 font-mono">
                    No results found for "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Quick Symbol Selection */}
      <div className="mt-3 flex flex-wrap gap-2">
        {['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS', 'HDFCBANK'].map((symbol) => (
          <button
            key={symbol}
            onClick={() => handleSymbolSelect(symbol)}
            className={`px-3 py-1.5 text-sm font-mono rounded-sm transition-all duration-200 ${
              selectedSymbol === symbol
                ? 'bg-green-600/30 text-green-300 border border-green-600/50'
                : 'bg-slate-800/60 text-slate-300 border border-slate-600/50 hover:bg-slate-700/60 hover:text-green-300'
            }`}
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IntelligentSearch;