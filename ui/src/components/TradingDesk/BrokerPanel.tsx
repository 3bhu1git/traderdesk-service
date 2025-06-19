import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, RefreshCw, Loader, AlertCircle, Check, DollarSign, BarChart3, Clock } from 'lucide-react';
import { DhanApiService } from '../../services/dhanApiService';
import { useNavigate } from 'react-router-dom';
import { LocalStorageService } from '../../lib/localStorage';
import ErrorBoundary from '../common/ErrorBoundary';

interface BrokerPanelProps {
  symbol: string;
}

const BrokerPanel: React.FC<BrokerPanelProps> = ({ symbol }) => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [funds, setFunds] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'holdings' | 'positions'>('positions');

  // Check if broker is connected
  useEffect(() => {
    const checkConnection = async () => {
      const storedCredentials = localStorage.getItem('dhanCredentials');
      if (storedCredentials) {
        try {
          const credentials = JSON.parse(storedCredentials);
          DhanApiService.initialize(credentials);
          const isAuthenticated = await DhanApiService.authenticate();
          setIsConnected(isAuthenticated);
          
          if (isAuthenticated) {
            fetchBrokerData();
            logConnection('dhan', credentials.clientId, 'connected');
          }
        } catch (error) {
          console.error('Error checking broker connection:', error);
          setIsConnected(false);
          setError('Failed to connect to broker. Please reconnect.');
        }
      } else {
        setIsConnected(false);
      }
    };
    
    checkConnection();
  }, []);

  const fetchBrokerData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [holdingsData, positionsData, fundsData] = await Promise.all([
        DhanApiService.getHoldings(),
        DhanApiService.getPositions(),
        DhanApiService.getFunds()
      ]);
      
      setHoldings(holdingsData);
      setPositions(positionsData);
      setFunds(fundsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching broker data:', error);
      setError('Failed to fetch broker data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logConnection = async (broker: string, clientId: string, status: string) => {
    try {
      // Get current user ID from localStorage
      const currentUser = localStorage.getItem('traderdesk_user');
      if (!currentUser) {
        console.warn('No current user found, skipping connection log');
        return;
      }
      
      const user = JSON.parse(currentUser);
      
      LocalStorageService.saveBrokerConnection({
        user_id: user.id,
        broker,
        client_id: clientId,
        status,
        last_connected_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging connection:', error);
    }
  };

  const handleRefresh = async () => {
    await fetchBrokerData();
  };

  const getPositionForSymbol = () => {
    return positions.find(position => position.symbol === symbol);
  };

  const getHoldingForSymbol = () => {
    return holdings.find(holding => holding.symbol === symbol);
  };

  const currentPosition = getPositionForSymbol();
  const currentHolding = getHoldingForSymbol();

  return (
    <ErrorBoundary>
      <div className="professional-card border border-slate-700/50 flex flex-col h-full">
        <div className="p-3 border-b border-slate-700/50 bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            <h2 className="text-base font-semibold text-slate-200 font-mono">BROKER PANEL</h2>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-1 text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-sm font-mono border border-green-700/50">
                <Check className="w-3 h-3" />
                <span>CONNECTED</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded-sm font-mono border border-red-700/50">
                <AlertCircle className="w-3 h-3" />
                <span>DISCONNECTED</span>
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={isLoading || !isConnected}
              className="p-1.5 rounded-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-300 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {!isConnected ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <LinkIcon className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400 text-center mb-4">Connect your broker to view positions and place orders</p>
            <button
              onClick={() => navigate('/broker')}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-sm hover:from-green-700 hover:to-green-600 transition-all duration-200 text-sm"
            >
              Connect Broker
            </button>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <p className="text-red-400 text-center mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800/60 border border-slate-600/50 text-slate-300 rounded-sm hover:bg-slate-700/60 transition-colors text-sm"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  <span>Refreshing...</span>
                </>
              ) : (
                'Try Again'
              )}
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <Loader className="w-12 h-12 text-green-400 animate-spin mb-3" />
            <p className="text-slate-400 text-center">Loading broker data...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Funds Summary */}
            {funds && (
              <div className="p-3 border-b border-slate-700/50 bg-slate-800/20">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-slate-200 font-mono">FUNDS</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-400">Available:</span>
                    <div className="font-medium text-green-400">₹{funds.availableBalance?.toLocaleString() || '0.00'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Used Margin:</span>
                    <div className="font-medium text-slate-300">₹{funds.usedMargin?.toLocaleString() || '0.00'}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Current Symbol Position/Holding */}
            {(currentPosition || currentHolding) && (
              <div className="p-3 border-b border-slate-700/50 bg-green-900/10">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-slate-200 font-mono">{symbol} POSITION</h3>
                </div>
                {currentPosition && (
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-slate-400">Quantity:</span>
                      <div className="font-medium text-slate-300">{currentPosition.quantity}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Avg. Price:</span>
                      <div className="font-medium text-slate-300">₹{currentPosition.averagePrice?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">P&L:</span>
                      <div className={`font-medium ${currentPosition.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ₹{currentPosition.pnl?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">P&L %:</span>
                      <div className={`font-medium ${currentPosition.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {currentPosition.pnlPercentage >= 0 ? '+' : ''}{currentPosition.pnlPercentage?.toFixed(2) || '0.00'}%
                      </div>
                    </div>
                  </div>
                )}
                {!currentPosition && currentHolding && (
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-slate-400">Quantity:</span>
                      <div className="font-medium text-slate-300">{currentHolding.quantity}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Avg. Price:</span>
                      <div className="font-medium text-slate-300">₹{currentHolding.averagePrice?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">P&L:</span>
                      <div className={`font-medium ${currentHolding.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ₹{currentHolding.pnl?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">P&L %:</span>
                      <div className={`font-medium ${currentHolding.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {currentHolding.pnlPercentage >= 0 ? '+' : ''}{currentHolding.pnlPercentage?.toFixed(2) || '0.00'}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Tabs */}
            <div className="flex border-b border-slate-700/50">
              <button
                onClick={() => setActiveTab('positions')}
                className={`flex-1 py-2 text-xs font-mono ${
                  activeTab === 'positions'
                    ? 'text-green-400 border-b-2 border-green-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                POSITIONS
              </button>
              <button
                onClick={() => setActiveTab('holdings')}
                className={`flex-1 py-2 text-xs font-mono ${
                  activeTab === 'holdings'
                    ? 'text-green-400 border-b-2 border-green-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                HOLDINGS
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto professional-scroll">
              {activeTab === 'positions' && (
                <div className="p-2">
                  {positions.length > 0 ? (
                    <div className="space-y-2">
                      {positions.map((position, index) => (
                        <div key={index} className="p-2 bg-slate-800/30 rounded-sm border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                          <div className="flex justify-between items-center mb-1">
                            <div className="text-xs font-medium text-slate-200 font-mono">{position.symbol}</div>
                            <div className={`text-xs font-medium ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'} font-mono`}>
                              {position.pnl >= 0 ? '+' : ''}₹{position.pnl?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-slate-400 font-mono">
                            <span>Qty: {position.quantity}</span>
                            <span>{position.pnlPercentage >= 0 ? '+' : ''}{position.pnlPercentage?.toFixed(2) || '0.00'}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <BarChart3 className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-slate-400 text-sm text-center">No open positions</p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'holdings' && (
                <div className="p-2">
                  {holdings.length > 0 ? (
                    <div className="space-y-2">
                      {holdings.map((holding, index) => (
                        <div key={index} className="p-2 bg-slate-800/30 rounded-sm border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                          <div className="flex justify-between items-center mb-1">
                            <div className="text-xs font-medium text-slate-200 font-mono">{holding.symbol}</div>
                            <div className={`text-xs font-medium ${holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'} font-mono`}>
                              {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-slate-400 font-mono">
                            <span>Qty: {holding.quantity}</span>
                            <span>{holding.pnlPercentage >= 0 ? '+' : ''}{holding.pnlPercentage?.toFixed(2) || '0.00'}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <BarChart3 className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-slate-400 text-sm text-center">No holdings found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Last Updated */}
            <div className="p-2 border-t border-slate-700/50 bg-slate-800/20 text-xs text-slate-500 font-mono flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="text-green-400 hover:text-green-300 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default BrokerPanel;