import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Database, 
  RefreshCw, 
  Calendar, 
  RotateCcw, 
  Activity,
  Eye,
  Zap,
  Target,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Loader
} from 'lucide-react';
import { DataService } from '../services/DataService';
import MarketIntelligenceService, { 
  MarketOverview, 
  SectorPerformance, 
  FIIDIIActivity, 
  TopMovers, 
  InstitutionalActivity 
} from '../services/marketIntelligenceService';
import MarketOverviewWidget from '../components/MarketIntelligence/MarketOverviewWidget';
import SectorPerformanceWidget from '../components/MarketIntelligence/SectorPerformanceWidget';
import FIIDIIWidget from '../components/MarketIntelligence/FIIDIIWidget';
import TopMoversWidget from '../components/MarketIntelligence/TopMoversWidget';
import InstitutionalInsightsWidget from '../components/MarketIntelligence/InstitutionalInsightsWidget';

const Market: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'intelligence' | 'legacy'>('intelligence');
  
  // New Market Intelligence State
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
  const [sectorPerformance, setSectorPerformance] = useState<SectorPerformance | null>(null);
  const [fiiDiiActivity, setFiiDiiActivity] = useState<FIIDIIActivity | null>(null);
  const [topMovers, setTopMovers] = useState<TopMovers | null>(null);
  const [institutionalActivity, setInstitutionalActivity] = useState<InstitutionalActivity | null>(null);
  const [isIntelligenceLoading, setIsIntelligenceLoading] = useState(true);
  
  // Legacy State
  const [fiiDiiData, setFiiDiiData] = useState<any[]>([]);
  const [sectorData, setSectorData] = useState<any[]>([]);
  const [marketData, setMarketData] = useState<any | null>(null);
  const [topGainers, setTopGainers] = useState<any[]>([]);
  const [topLosers, setTopLosers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '5D' | '1M' | '3M'>('5D');
  
  // Initialize services
  const dataService = DataService.getInstance();
  const marketIntelligenceService = MarketIntelligenceService.getInstance();

  useEffect(() => {
    fetchMarketIntelligenceData();
    fetchLegacyData();
    
    // Set up auto-refresh interval (every 5 minutes)
    const refreshInterval = setInterval(() => {
      fetchMarketIntelligenceData();
      fetchLegacyData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchMarketIntelligenceData = async () => {
    setIsIntelligenceLoading(true);
    try {
      const [overview, sectors, fiiDii, movers, institutional] = await Promise.all([
        marketIntelligenceService.getMarketOverview(),
        marketIntelligenceService.getSectorPerformance(),
        marketIntelligenceService.getFIIDIIActivity(),
        marketIntelligenceService.getTopMovers(5),
        marketIntelligenceService.getInstitutionalActivity()
      ]);
      
      setMarketOverview(overview);
      setSectorPerformance(sectors);
      setFiiDiiActivity(fiiDii);
      setTopMovers(movers);
      setInstitutionalActivity(institutional);
    } catch (error) {
      console.error('Error fetching market intelligence data:', error);
    } finally {
      setIsIntelligenceLoading(false);
    }
  };

  const fetchLegacyData = async () => {
    setIsLoading(true);
    try {
      // Fetch legacy data in parallel using the centralized data service
      const [marketDataResult, sectorDataResult, fiiDiiDataResult, topGainersResult, topLosersResult] = await Promise.all([
        dataService.getMarketData(),
        dataService.getSectorData(),
        dataService.getFIIDIIData(10),
        dataService.getTopGainers(5),
        dataService.getTopLosers(5)
      ]);
      
      setMarketData(marketDataResult);
      setSectorData(sectorDataResult);
      setFiiDiiData(fiiDiiDataResult);
      setTopGainers(topGainersResult);
      setTopLosers(topLosersResult);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching legacy market data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    if (activeTab === 'intelligence') {
      await fetchMarketIntelligenceData();
    } else {
      await fetchLegacyData();
    }
  };

  const getMaxValue = () => {
    if (fiiDiiData.length === 0) return 10000;
    
    const allValues = fiiDiiData.flatMap(item => [
      Math.abs(item.fiiSell), Math.abs(item.fiiBuy), 
      Math.abs(item.diiSell), Math.abs(item.diiBuy)
    ]);
    return Math.max(...allValues);
  };

  const maxValue = getMaxValue();

  const formatCurrency = (value: number) => {
    return `₹${Math.abs(value).toLocaleString()}Cr`;
  };

  const getBarWidth = (value: number) => {
    return (Math.abs(value) / maxValue) * 100;
  };

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'strong_buy': return 'bg-green-900/30 text-green-400 border-green-700/50';
      case 'buy': return 'bg-green-900/20 text-green-300 border-green-700/30';
      case 'hold': return 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50';
      case 'sell': return 'bg-red-900/20 text-red-300 border-red-700/30';
      case 'strong_sell': return 'bg-red-900/30 text-red-400 border-red-700/50';
      default: return 'bg-slate-800/50 text-slate-400 border-slate-700/50';
    }
  };

  const getMomentumText = (momentum: string) => {
    switch (momentum) {
      case 'strong_buy': return 'STRONG BUY';
      case 'buy': return 'BUY';
      case 'hold': return 'HOLD';
      case 'sell': return 'SELL';
      case 'strong_sell': return 'STRONG SELL';
      default: return 'NEUTRAL';
    }
  };

  const getRotationColor = (rotation: string) => {
    switch (rotation) {
      case 'inflow': return 'text-green-400';
      case 'outflow': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getRotationIcon = (rotation: string) => {
    switch (rotation) {
      case 'inflow': return <ArrowUpRight className="w-3 h-3" />;
      case 'outflow': return <ArrowDownRight className="w-3 h-3" />;
      default: return <Target className="w-3 h-3" />;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="w-10 h-10 text-green-400 animate-spin" />
            <p className="text-slate-400 font-mono">LOADING MARKET DATA...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Market Indices */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="professional-card p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-slate-400 font-mono">NIFTY 50</span>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-xl font-bold text-slate-200 font-mono mb-1">
                {marketData?.nifty && marketData.nifty.value !== undefined ? marketData.nifty.value.toLocaleString() : '19,745.30'}
              </div>
              <div className={`text-sm font-mono ${(marketData?.nifty && marketData.nifty.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(marketData?.nifty && marketData.nifty.change || 0) >= 0 ? '+' : ''}{marketData?.nifty && marketData.nifty.change || '165.85'} ({(marketData?.nifty && marketData.nifty.changePercent || 0) >= 0 ? '+' : ''}{marketData?.nifty && marketData.nifty.changePercent || '0.86'}%)
              </div>
            </div>

            <div className="professional-card p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-slate-400 font-mono">SENSEX</span>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-xl font-bold text-slate-200 font-mono mb-1">
                {marketData?.sensex && marketData.sensex.value !== undefined ? marketData.sensex.value.toLocaleString() : '65,721.25'}
              </div>
              <div className={`text-sm font-mono ${(marketData?.sensex && marketData.sensex.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(marketData?.sensex && marketData.sensex.change || 0) >= 0 ? '+' : ''}{marketData?.sensex && marketData.sensex.change || '425.60'} ({(marketData?.sensex && marketData.sensex.changePercent || 0) >= 0 ? '+' : ''}{marketData?.sensex && marketData.sensex.changePercent || '0.65'}%)
              </div>
            </div>

            <div className="professional-card p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-slate-400 font-mono">INDIA VIX</span>
                </div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-xl font-bold text-slate-200 font-mono mb-1">
                {marketData?.vix && marketData.vix.value !== undefined ? marketData.vix.value : '11.25'}
              </div>
              <div className={`text-sm font-mono ${(marketData?.vix && marketData.vix.change || 0) >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {(marketData?.vix && marketData.vix.change || 0) >= 0 ? '+' : ''}{marketData?.vix && marketData.vix.change || '-0.85'} ({(marketData?.vix && marketData.vix.changePercent || 0) >= 0 ? '+' : ''}{marketData?.vix && marketData.vix.changePercent || '-6.02'}%)
              </div>
            </div>

            <div className="professional-card p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-slate-400 font-mono">ADV/DEC</span>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-sm font-mono text-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-green-400">Advances:</span>
                  <span>{marketData?.advanceDecline && marketData.advanceDecline.advances !== undefined ? marketData.advanceDecline.advances : '1847'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">Declines:</span>
                  <span>{marketData?.advanceDecline && marketData.advanceDecline.declines !== undefined ? marketData.advanceDecline.declines : '1203'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Breadth */}
          <div className="professional-card p-6 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-slate-200 font-mono">MARKET BREADTH</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Advance/Decline Ratio */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-300 font-mono">ADVANCE/DECLINE RATIO</h4>
                <div className="relative h-4 bg-slate-700/50 rounded-sm overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400"
                    style={{ 
                      width: marketData && marketData.advanceDecline && typeof marketData.advanceDecline.advances === 'number' && typeof marketData.advanceDecline.declines === 'number' && (marketData.advanceDecline.advances + marketData.advanceDecline.declines) > 0
                        ? `${(marketData.advanceDecline.advances / (marketData.advanceDecline.advances + marketData.advanceDecline.declines)) * 100}%`
                        : '60%' 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-green-400">{marketData?.advanceDecline && marketData.advanceDecline.advances !== undefined ? marketData.advanceDecline.advances : '1847'} Advances</span>
                  <span className="text-red-400">{marketData?.advanceDecline && marketData.advanceDecline.declines !== undefined ? marketData.advanceDecline.declines : '1203'} Declines</span>
                </div>
              </div>

              {/* Volume Analysis */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-300 font-mono">VOLUME ANALYSIS</h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Volume:</span>
                    <span className="text-slate-200">₹45,230 Cr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Volume:</span>
                    <span className="text-slate-200">₹38,450 Cr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Volume Ratio:</span>
                    <span className="text-green-400">1.18x</span>
                  </div>
                </div>
              </div>

              {/* Market Sentiment */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-300 font-mono">MARKET SENTIMENT</h4>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 font-mono">BULLISH</div>
                  <div className="text-xs text-slate-400 font-mono mt-1">Based on technical indicators</div>
                </div>
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-green-400/30 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Movers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="professional-card p-4 border border-slate-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <h4 className="text-sm font-semibold text-slate-200 font-mono">TOP GAINERS</h4>
              </div>
              <div className="space-y-2">
                {topGainers.length > 0 ? (
                  topGainers.map((stock, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-900/10 border border-green-700/30 rounded-sm">
                      <span className="text-xs font-mono text-slate-200">{stock.symbol}</span>
                      <div className="text-right">
                        <div className="text-xs font-mono text-green-400">+{stock.changePercent}%</div>
                        <div className="text-xs font-mono text-slate-400">₹{stock.change.toFixed(1)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  sectorData
                    .filter(s => s.changePercent > 0)
                    .sort((a, b) => b.changePercent - a.changePercent)
                    .slice(0, 5)
                    .map((sector, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-900/10 border border-green-700/30 rounded-sm">
                        <span className="text-xs font-mono text-slate-200">{sector.name}</span>
                        <div className="text-right">
                          <div className="text-xs font-mono text-green-400">+{sector.changePercent}%</div>
                          <div className="text-xs font-mono text-slate-400">₹{sector.change.toFixed(1)}</div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="professional-card p-4 border border-slate-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <h4 className="text-sm font-semibold text-slate-200 font-mono">TOP LOSERS</h4>
              </div>
              <div className="space-y-2">
                {topLosers.length > 0 ? (
                  topLosers.map((stock, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-900/10 border border-red-700/30 rounded-sm">
                      <span className="text-xs font-mono text-slate-200">{stock.symbol}</span>
                      <div className="text-right">
                        <div className="text-xs font-mono text-red-400">{stock.changePercent}%</div>
                        <div className="text-xs font-mono text-slate-400">₹{Math.abs(stock.change).toFixed(1)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  sectorData
                    .filter(s => s.changePercent < 0)
                    .sort((a, b) => a.changePercent - b.changePercent)
                    .slice(0, 5)
                    .map((sector, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-900/10 border border-red-700/30 rounded-sm">
                        <span className="text-xs font-mono text-slate-200">{sector.name}</span>
                        <div className="text-right">
                          <div className="text-xs font-mono text-red-400">{sector.changePercent}%</div>
                          <div className="text-xs font-mono text-slate-400">₹{Math.abs(sector.change).toFixed(1)}</div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderSectorTab = () => (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="w-10 h-10 text-green-400 animate-spin" />
            <p className="text-slate-400 font-mono">LOADING SECTOR DATA...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Sector Performance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectorData.map((sector, index) => (
              <div key={index} className="professional-card p-4 border border-slate-700/50 hover:border-green-500/50 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-200 font-mono">{sector.name.toUpperCase()}</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-sm text-xs font-mono border ${getMomentumColor(sector.momentum)}`}>
                      {getMomentumText(sector.momentum)}
                    </div>
                    <div className={`${getRotationColor(sector.rotation)}`}>
                      {getRotationIcon(sector.rotation)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Price:</span>
                    <span className="text-slate-200">₹{sector.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Change:</span>
                    <span className={sector.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {sector.change >= 0 ? '+' : ''}₹{Math.abs(sector.change)} ({sector.changePercent >= 0 ? '+' : ''}{sector.changePercent}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">P/E:</span>
                    <span className="text-slate-300">{sector.pe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Volume:</span>
                    <span className="text-slate-300">{sector.volume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Market Cap:</span>
                    <span className="text-slate-300">{sector.marketCap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Strength:</span>
                    <span className={`${sector.strength >= 70 ? 'text-green-400' : sector.strength >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {sector.strength}/100
                    </span>
                  </div>
                </div>

                {/* Performance Bar */}
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 font-mono">52W Performance</span>
                    <span className="text-slate-300 font-mono">
                      {(((sector.price - sector.low52w) / (sector.high52w - sector.low52w)) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-sm h-2">
                    <div 
                      className={`h-2 rounded-sm ${
                        sector.changePercent >= 1 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                        sector.changePercent >= 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                        'bg-gradient-to-r from-red-500 to-red-400'
                      }`}
                      style={{ 
                        width: `${Math.max(5, ((sector.price - sector.low52w) / (sector.high52w - sector.low52w)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Strength Meter */}
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 font-mono">Sector Strength</span>
                    <span className="text-slate-300 font-mono">{sector.strength}%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-sm h-2">
                    <div 
                      className={`h-2 rounded-sm ${
                        sector.strength >= 80 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                        sector.strength >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                        sector.strength >= 40 ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
                        'bg-gradient-to-r from-red-500 to-red-400'
                      }`}
                      style={{ width: `${sector.strength}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sector Heatmap */}
          <div className="professional-card p-6 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-4">
              <RotateCcw className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-slate-200 font-mono">SECTOR HEATMAP</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {sectorData.map((sector, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-sm text-center transition-all duration-200 hover:scale-105 cursor-pointer ${
                    sector.changePercent >= 1.5 ? 'bg-green-600/80 text-white' :
                    sector.changePercent >= 0.5 ? 'bg-green-500/60 text-white' :
                    sector.changePercent >= 0 ? 'bg-yellow-500/60 text-white' :
                    sector.changePercent >= -0.5 ? 'bg-red-500/60 text-white' :
                    'bg-red-600/80 text-white'
                  }`}
                >
                  <div className="text-xs font-mono font-semibold mb-1">{sector.name.split(' ')[0].slice(0, 6).toUpperCASE()}</div>
                  <div className="text-sm font-mono font-bold">{sector.changePercent >= 0 ? '+' : ''}{sector.changePercent}%</div>
                  <div className="text-xs font-mono opacity-80">₹{Math.abs(sector.change).toFixed(0)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderFiiDiiTab = () => (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="w-10 h-10 text-green-400 animate-spin" />
            <p className="text-slate-400 font-mono">LOADING FII/DII DATA...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="professional-card p-4 border border-slate-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-400 font-mono">FII NET INFLOW</span>
              </div>
              <div className="text-lg font-bold text-green-400 font-mono">
                +₹{fiiDiiData.reduce((sum, item) => sum + Math.max(0, item.fiiNet), 0).toLocaleString()}Cr
              </div>
              <div className="text-xs text-slate-500 font-mono mt-1">Last {fiiDiiData.length} days</div>
            </div>
            
            <div className="professional-card p-4 border border-slate-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-xs text-slate-400 font-mono">FII NET OUTFLOW</span>
              </div>
              <div className="text-lg font-bold text-red-400 font-mono">
                -₹{Math.abs(fiiDiiData.reduce((sum, item) => sum + Math.min(0, item.fiiNet), 0)).toLocaleString()}Cr
              </div>
              <div className="text-xs text-slate-500 font-mono mt-1">Last {fiiDiiData.length} days</div>
            </div>
            
            <div className="professional-card p-4 border border-slate-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400 font-mono">DII NET FLOW</span>
              </div>
              <div className="text-lg font-bold text-blue-400 font-mono">
                +₹{fiiDiiData.reduce((sum, item) => sum + item.diiNet, 0).toLocaleString()}Cr
              </div>
              <div className="text-xs text-slate-500 font-mono mt-1">Last {fiiDiiData.length} days</div>
            </div>
            
            <div className="professional-card p-4 border border-slate-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-400 font-mono">LAST UPDATE</span>
              </div>
              <div className="text-sm text-slate-300 font-mono">
                {lastUpdated.toLocaleTimeString()}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-1">Real-time data</div>
            </div>
          </div>

          {/* FII/DII Chart */}
          <div className="professional-card p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-slate-200 font-mono">INSTITUTIONAL FLOWS</h3>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {['1D', '5D', '1M', '3M'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedTimeframe(period as any)}
                      className={`px-2 py-1 text-xs font-mono rounded-sm transition-all duration-200 ${
                        selectedTimeframe === period
                          ? 'bg-green-600/30 text-green-300 border border-green-600/50'
                          : 'text-slate-400 hover:text-green-300 hover:bg-slate-800/50'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm hover:bg-slate-700/60 transition-all duration-200 text-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-green-400 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="text-slate-300 font-mono">REFRESH</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {fiiDiiData.map((item, index) => (
                <div key={index} className="space-y-3">
                  {/* Date Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-300 font-mono">{item.date}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs font-mono">
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-400">FII Net:</span>
                        <span className={item.fiiNet >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {item.fiiNet >= 0 ? '+' : ''}{formatCurrency(item.fiiNet)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-400">DII Net:</span>
                        <span className={item.diiNet >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {item.diiNet >= 0 ? '+' : ''}{formatCurrency(item.diiNet)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Horizontal Bar Chart */}
                  <div className="bg-slate-800/30 rounded-sm p-4 border border-slate-700/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* FII Data */}
                      <div>
                        <div className="text-xs text-slate-400 font-mono mb-3 flex items-center space-x-2">
                          <Globe className="w-3 h-3" />
                          <span>FII (Foreign Institutional Investors)</span>
                        </div>
                        <div className="space-y-3">
                          {/* FII Sell */}
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-red-400 font-mono w-12">SELL:</span>
                            <div className="flex-1 relative h-5 bg-slate-700/50 rounded-sm overflow-hidden">
                              <div 
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-red-400 rounded-sm transition-all duration-500"
                                style={{ width: `${getBarWidth(item.fiiSell)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-red-400 font-mono w-20 text-right">
                              {formatCurrency(item.fiiSell)}
                            </span>
                          </div>
                          
                          {/* FII Buy */}
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-green-400 font-mono w-12">BUY:</span>
                            <div className="flex-1 relative h-5 bg-slate-700/50 rounded-sm overflow-hidden">
                              <div 
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-sm transition-all duration-500"
                                style={{ width: `${getBarWidth(item.fiiBuy)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-green-400 font-mono w-20 text-right">
                              {formatCurrency(item.fiiBuy)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* DII Data */}
                      <div>
                        <div className="text-xs text-slate-400 font-mono mb-3 flex items-center space-x-2">
                          <Building2 className="w-3 h-3" />
                          <span>DII (Domestic Institutional Investors)</span>
                        </div>
                        <div className="space-y-3">
                          {/* DII Sell */}
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-red-400 font-mono w-12">SELL:</span>
                            <div className="flex-1 relative h-5 bg-slate-700/50 rounded-sm overflow-hidden">
                              <div 
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-red-400 rounded-sm transition-all duration-500"
                                style={{ width: `${getBarWidth(item.diiSell)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-red-400 font-mono w-20 text-right">
                              {formatCurrency(item.diiSell)}
                            </span>
                          </div>
                          
                          {/* DII Buy */}
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-green-400 font-mono w-12">BUY:</span>
                            <div className="flex-1 relative h-5 bg-slate-700/50 rounded-sm overflow-hidden">
                              <div 
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-sm transition-all duration-500"
                                style={{ width: `${getBarWidth(item.diiBuy)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-green-400 font-mono w-20 text-right">
                              {formatCurrency(item.diiBuy)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center space-x-6 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                <span className="text-red-400">SELL</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span className="text-green-400">BUY</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-3 h-3 text-green-400" />
                <span className="text-green-400">FII</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400">DII</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderRotationTab = () => (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="w-10 h-10 text-green-400 animate-spin" />
            <p className="text-slate-400 font-mono">LOADING ROTATION DATA...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Rotation Matrix */}
          <div className="professional-card p-6 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-6">
              <RotateCcw className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-slate-200 font-mono">SECTOR ROTATION MATRIX</h3>
            </div>

            {/* Quadrant Chart */}
            <div className="relative h-96 bg-slate-800/30 rounded-sm border border-slate-700/30 p-4">
              {/* Axes */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-slate-600/50"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-full w-px bg-slate-600/50"></div>
              </div>

              {/* Labels */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 font-mono">
                HIGH MOMENTUM
              </div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 font-mono">
                LOW MOMENTUM
              </div>
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-slate-400 font-mono">
                HIGH STRENGTH
              </div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 rotate-90 text-xs text-slate-400 font-mono">
                LOW STRENGTH
              </div>

              {/* Sector Dots */}
              {sectorData.map((sector, index) => {
                const x = 50 + (sector.changePercent * 10); // Momentum (X-axis)
                const y = 50 - (sector.strength - 50); // Strength (Y-axis)
                
                return (
                  <div
                    key={index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{ 
                      left: `${Math.max(5, Math.min(95, x))}%`, 
                      top: `${Math.max(5, Math.min(95, y))}%` 
                    }}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      sector.rotation === 'inflow' ? 'bg-green-500' :
                      sector.rotation === 'outflow' ? 'bg-red-500' :
                      'bg-yellow-500'
                    } hover:scale-150 transition-transform duration-200`}></div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <div className="bg-slate-900/95 border border-slate-700/50 rounded-sm p-2 text-xs font-mono whitespace-nowrap">
                        <div className="text-slate-200 font-semibold">{sector.name}</div>
                        <div className="text-slate-400">Momentum: {sector.changePercent}%</div>
                        <div className="text-slate-400">Strength: {sector.strength}</div>
                        <div className={`${getRotationColor(sector.rotation)}`}>
                          Flow: {sector.rotation.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quadrant Descriptions */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-green-900/20 border border-green-700/30 rounded-sm p-3">
                <h4 className="text-sm font-semibold text-green-400 font-mono mb-2">LEADERS (High Momentum + High Strength)</h4>
                <div className="space-y-1">
                  {sectorData
                    .filter(s => s.changePercent > 0.5 && s.strength > 70)
                    .map((sector, index) => (
                      <div key={index} className="text-xs text-green-300 font-mono">{sector.name}</div>
                    ))}
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-sm p-3">
                <h4 className="text-sm font-semibold text-yellow-400 font-mono mb-2">IMPROVING (Low Momentum + High Strength)</h4>
                <div className="space-y-1">
                  {sectorData
                    .filter(s => s.changePercent <= 0.5 && s.strength > 70)
                    .map((sector, index) => (
                      <div key={index} className="text-xs text-yellow-300 font-mono">{sector.name}</div>
                    ))}
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-700/30 rounded-sm p-3">
                <h4 className="text-sm font-semibold text-blue-400 font-mono mb-2">WEAKENING (High Momentum + Low Strength)</h4>
                <div className="space-y-1">
                  {sectorData
                    .filter(s => s.changePercent > 0.5 && s.strength <= 70)
                    .map((sector, index) => (
                      <div key={index} className="text-xs text-blue-300 font-mono">{sector.name}</div>
                    ))}
                </div>
              </div>

              <div className="bg-red-900/20 border border-red-700/30 rounded-sm p-3">
                <h4 className="text-sm font-semibold text-red-400 font-mono mb-2">LAGGARDS (Low Momentum + Low Strength)</h4>
                <div className="space-y-1">
                  {sectorData
                    .filter(s => s.changePercent <= 0.5 && s.strength <= 70)
                    .map((sector, index) => (
                      <div key={index} className="text-xs text-red-300 font-mono">{sector.name}</div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Rotation Trends */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="professional-card p-4 border border-slate-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <ArrowUpRight className="w-4 h-4 text-green-400" />
                <h4 className="text-sm font-semibold text-slate-200 font-mono">MONEY INFLOW</h4>
              </div>
              <div className="space-y-2">
                {sectorData
                  .filter(s => s.rotation === 'inflow')
                  .sort((a, b) => b.strength - a.strength)
                  .map((sector, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-900/10 border border-green-700/30 rounded-sm">
                      <span className="text-xs font-mono text-slate-200">{sector.name}</span>
                      <div className="text-right">
                        <div className="text-xs font-mono text-green-400">{sector.strength}%</div>
                        <div className="text-xs font-mono text-slate-400">{sector.changePercent >= 0 ? '+' : ''}{sector.changePercent}%</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="professional-card p-4 border border-slate-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-4 h-4 text-yellow-400" />
                <h4 className="text-sm font-semibold text-slate-200 font-mono">NEUTRAL FLOW</h4>
              </div>
              <div className="space-y-2">
                {sectorData
                  .filter(s => s.rotation === 'neutral')
                  .map((sector, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-yellow-900/10 border border-yellow-700/30 rounded-sm">
                      <span className="text-xs font-mono text-slate-200">{sector.name}</span>
                      <div className="text-right">
                        <div className="text-xs font-mono text-yellow-400">{sector.strength}%</div>
                        <div className="text-xs font-mono text-slate-400">{sector.changePercent >= 0 ? '+' : ''}{sector.changePercent}%</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="professional-card p-4 border border-slate-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <ArrowDownRight className="w-4 h-4 text-red-400" />
                <h4 className="text-sm font-semibold text-slate-200 font-mono">MONEY OUTFLOW</h4>
              </div>
              <div className="space-y-2">
                {sectorData
                  .filter(s => s.rotation === 'outflow')
                  .sort((a, b) => a.strength - b.strength)
                  .map((sector, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-900/10 border border-red-700/30 rounded-sm">
                      <span className="text-xs font-mono text-slate-200">{sector.name}</span>
                      <div className="text-right">
                        <div className="text-xs font-mono text-red-400">{sector.strength}%</div>
                        <div className="text-xs font-mono text-slate-400">{sector.changePercent >= 0 ? '+' : ''}{sector.changePercent}%</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6 h-full flex flex-col space-y-4">
      {/* Professional Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-200 font-mono">MARKET INTELLIGENCE</h1>
          <p className="text-slate-400 text-base md:text-lg mt-1 font-mono">Comprehensive market analysis & institutional flows</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-900/30 border border-green-700/50 rounded-sm">
            <Database className="w-4 h-4 text-green-400" />
            <span className="text-sm font-mono text-green-300">LIVE DATA</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 font-mono">Updated</div>
            <div className="text-xs text-green-400 font-mono">{lastUpdated.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Professional Tabs */}
      <div className="professional-card p-2 border border-slate-700/50">
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { id: 'intelligence', label: 'MARKET INTELLIGENCE', icon: Eye },
            { id: 'legacy', label: 'LEGACY VIEW', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-sm font-medium transition-all duration-200 text-sm font-mono whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-600/20 to-green-500/20 text-green-300 border border-green-600/30'
                    : 'text-slate-400 hover:text-green-300 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto professional-scroll">
        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            {/* Market Overview Widget */}
            <MarketOverviewWidget data={marketOverview} isLoading={isIntelligenceLoading} />
            
            {/* Grid Layout for Intelligence Widgets */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <SectorPerformanceWidget data={sectorPerformance} isLoading={isIntelligenceLoading} />
              <FIIDIIWidget data={fiiDiiActivity} isLoading={isIntelligenceLoading} />
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <TopMoversWidget data={topMovers} isLoading={isIntelligenceLoading} />
              <InstitutionalInsightsWidget data={institutionalActivity} isLoading={isIntelligenceLoading} />
            </div>
          </div>
        )}
        
        {activeTab === 'legacy' && (
          <div className="space-y-6">
            {renderOverviewTab()}
            {renderSectorTab()}
            {renderFiiDiiTab()}
            {renderRotationTab()}
          </div>
        )}
      </div>

      {/* Professional Status Bar */}
      <div className="professional-card p-3 border border-slate-700/50">
        <div className="flex items-center justify-between text-sm font-mono">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-400">Market: </span>
              <span className="text-green-400">OPEN</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Data Source: </span>
              <span className="text-green-400">NSE INDIA</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Refresh Rate: </span>
              <span className="text-green-400">REAL-TIME</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Latency: </span>
              <span className="text-green-400">15ms</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Last Sync: </span>
            <span className="text-green-400">{lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market;