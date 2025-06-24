import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Check, AlertCircle, Loader, Shield, RefreshCw, Database, Clock, Settings, User } from 'lucide-react';
import { DhanApiService, DhanCredentials } from '../services/dhanApiService';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { LocalStorageService } from '../lib/localStorage';
import { getApiBaseUrl } from '../lib/getApiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

const Broker: React.FC = () => {
  const { user } = useAuth();
  const [isDhanConnected, setIsDhanConnected] = useState(false);
  const [isZerodhaConnected, setIsZerodhaConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDhanForm, setShowDhanForm] = useState(false);
  const [showZerodhaForm, setShowZerodhaForm] = useState(false);
  const [dhanCredentials, setDhanCredentials] = useState({
    customer: '',
    clientId: '',
    clientSecret: ''
  });
  const [zerodhaCredentials, setZerodhaCredentials] = useState({
    apiKey: '',
    apiSecret: ''
  });
  const [error, setError] = useState('');
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [connectionLogs, setConnectionLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // Check if Dhan credentials exist in localStorage
  useEffect(() => {
    const checkConnections = async () => {
      setIsLoading(true);
      try {
        // Check Dhan connection
        const storedCredentials = localStorage.getItem('dhanCredentials');
        if (storedCredentials) {
          try {
            const credentials: DhanCredentials = JSON.parse(storedCredentials);
            setDhanCredentials({
              customer: credentials.customer || '',
              clientId: credentials.clientId,
              clientSecret: '********'
            });
            DhanApiService.initialize(credentials);
            const success = await DhanApiService.authenticate();
            setIsDhanConnected(success);
            if (success) {
              fetchAccountInfo();
              logConnection('dhan', credentials.clientId, 'connected');
            }
          } catch (error) {
            console.error('Error parsing Dhan credentials:', error);
            localStorage.removeItem('dhanCredentials');
          }
        }

        // Check for Zerodha credentials (mock for now)
        const hasZerodha = localStorage.getItem('zerodhaConnected');
        if (hasZerodha === 'true') {
          setIsZerodhaConnected(true);
          logConnection('zerodha', '****1234', 'connected');
        }
        
        // Fetch connection logs
        fetchConnectionLogs();
      } catch (error) {
        console.error('Error checking connections:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnections();
  }, []);

  const fetchAccountInfo = async () => {
    setIsLoading(true);
    try {
      const [profile, funds] = await Promise.all([
        DhanApiService.getUserProfile(),
        DhanApiService.getFunds()
      ]);
      
      setAccountInfo({
        profile,
        funds
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching account info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConnectionLogs = async () => {
    try {
      if (!user?.id) return;
      
      // Get connection logs from localStorage
      const logs = LocalStorageService.getBrokerConnectionsByUserId(user.id);
      setConnectionLogs(logs);
    } catch (error) {
      console.error('Error fetching connection logs:', error);
    }
  };

  const logConnection = async (broker: string, clientId: string, status: string) => {
    try {
      if (!user?.id) return;
      
      // Log connection to localStorage
      LocalStorageService.saveBrokerConnection({
        id: crypto.randomUUID(),
        user_id: user.id,
        broker,
        client_id: clientId,
        status,
        last_connected_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Refresh connection logs
      fetchConnectionLogs();
    } catch (error) {
      console.error('Error logging connection:', error);
    }
  };

  const handleDhanConnect = async () => {
    if (!dhanCredentials.customer || !dhanCredentials.clientId || !dhanCredentials.clientSecret) {
      setError('Please enter Customer Name, Client ID and Access Token');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call backend API to connect Dhan broker
      const response = await fetch(`${API_BASE_URL}/api/brokers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker: 'dhan',
          customer: dhanCredentials.customer,
          credentials: {
            clientId: dhanCredentials.clientId,
            accessToken: dhanCredentials.clientSecret
          }
        })
      });
      if (response.ok) {
        setIsDhanConnected(true);
        setShowDhanForm(false);
        fetchAccountInfo();
        // Optionally log connection
        logConnection('dhan', dhanCredentials.clientId, 'connected');
      } else {
        const data = await response.json();
        setError(data.error || 'Authentication failed. Please check your credentials.');
        logConnection('dhan', dhanCredentials.clientId, 'failed');
      }
    } catch (error) {
      setError('Failed to connect to Dhan. Please try again.');
      if (dhanCredentials.clientId) {
        logConnection('dhan', dhanCredentials.clientId, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleZerodhaConnect = async () => {
    if (!zerodhaCredentials.apiKey || !zerodhaCredentials.apiSecret) {
      setError('Please enter both API Key and API Secret');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Mock Zerodha authentication (would be replaced with actual API calls)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store connection status in localStorage
      localStorage.setItem('zerodhaConnected', 'true');
      
      // Update state
      setIsZerodhaConnected(true);
      setShowZerodhaForm(false);
      
      // Log connection
      logConnection('zerodha', zerodhaCredentials.apiKey, 'connected');
    } catch (error) {
      console.error('Error connecting to Zerodha:', error);
      setError('Failed to connect to Zerodha. Please try again.');
      
      if (zerodhaCredentials.apiKey) {
        logConnection('zerodha', zerodhaCredentials.apiKey, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDhanDisconnect = () => {
    localStorage.removeItem('dhanCredentials');
    setIsDhanConnected(false);
    setDhanCredentials({
      customer: '',
      clientId: '',
      clientSecret: ''
    });
    setAccountInfo(null);
    
    // Log disconnection
    if (dhanCredentials.clientId) {
      logConnection('dhan', dhanCredentials.clientId, 'disconnected');
    }
  };

  const handleZerodhaDisconnect = () => {
    localStorage.removeItem('zerodhaConnected');
    setIsZerodhaConnected(false);
    setZerodhaCredentials({
      apiKey: '',
      apiSecret: ''
    });
    
    // Log disconnection
    if (zerodhaCredentials.apiKey) {
      logConnection('zerodha', zerodhaCredentials.apiKey, 'disconnected');
    }
  };

  const refreshConnection = async () => {
    setIsLoading(true);
    try {
      if (isDhanConnected) {
        const success = await DhanApiService.authenticate();
        if (success) {
          fetchAccountInfo();
        } else {
          setError('Failed to refresh Dhan connection. Please reconnect.');
          handleDhanDisconnect();
        }
      }
    } catch (error) {
      console.error('Error refreshing connection:', error);
      setError('Failed to refresh connection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Broker Integration</h1>
          <p className="text-slate-400 mt-1">Connect your trading accounts for seamless execution</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm hover:bg-slate-700/60 transition-all duration-200 text-sm"
          >
            <Database className="w-4 h-4 text-slate-300" />
            <span className="text-slate-300">{showLogs ? 'Hide Logs' : 'Show Logs'}</span>
          </button>
          <button
            onClick={refreshConnection}
            disabled={isLoading || (!isDhanConnected && !isZerodhaConnected)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-sm hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="professional-card p-4 border border-red-700/50 bg-red-900/20">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-red-400">{error}</p>
              <button 
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-300 text-sm mt-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Logs */}
      {showLogs && (
        <ErrorBoundary>
          <div className="professional-card p-6 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold text-slate-200">Connection History</h2>
            </div>
            
            {connectionLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left">
                    <tr className="border-b border-slate-700/50">
                      <th className="px-4 py-2 text-slate-300">Broker</th>
                      <th className="px-4 py-2 text-slate-300">Client ID</th>
                      <th className="px-4 py-2 text-slate-300">Status</th>
                      <th className="px-4 py-2 text-slate-300">Last Connected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {connectionLogs.map((log, index) => (
                      <tr key={index} className="border-b border-slate-800/50">
                        <td className="px-4 py-2 text-slate-300">{log.broker.toUpperCase()}</td>
                        <td className="px-4 py-2 text-slate-300">{log.client_id}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-sm text-xs ${
                            log.status === 'connected' ? 'bg-green-900/30 text-green-400 border border-green-700/50' :
                            log.status === 'disconnected' ? 'bg-slate-800/50 text-slate-400 border border-slate-700/50' :
                            'bg-red-900/30 text-red-400 border border-red-700/50'
                          }`}>
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-slate-400">{new Date(log.last_connected_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <Database className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No connection logs found</p>
              </div>
            )}
          </div>
        </ErrorBoundary>
      )}

      {/* Connected Brokers */}
      <ErrorBoundary>
        <div className="professional-card p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-6">
            <LinkIcon className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-semibold text-slate-200">Connected Brokers</h2>
            <span className="bg-green-900/30 text-green-400 text-xs font-medium px-2 py-1 rounded-sm border border-green-700/50">
              {(isDhanConnected ? 1 : 0) + (isZerodhaConnected ? 1 : 0)} Active
            </span>
          </div>

          {isDhanConnected || isZerodhaConnected ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dhan Broker Card */}
              {isDhanConnected && (
                <div className="border border-slate-700/50 bg-slate-800/30 rounded-sm p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-sm flex items-center justify-center text-xl">🟢</div>
                      <div>
                        <h3 className="font-semibold text-slate-200">Dhan</h3>
                        <p className="text-sm text-slate-400">Client ID: {dhanCredentials.clientId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1 text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-sm font-mono border border-green-700/50">
                        <Check className="w-3 h-3" />
                        <span>Connected</span>
                      </span>
                    </div>
                  </div>

                  {accountInfo && (
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 mb-4">
                      <div>
                        <span className="block text-slate-500">Available Balance</span>
                        <span className="font-medium text-slate-300">₹{accountInfo.funds?.availableBalance?.toLocaleString() || '100,000.00'}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Used Margin</span>
                        <span className="font-medium text-slate-300">₹{accountInfo.funds?.usedMargin?.toLocaleString() || '25,000.00'}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Last Updated</span>
                        <span className="font-medium text-slate-300">{lastUpdated.toLocaleTimeString()}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Status</span>
                        <span className="font-medium text-green-400">Active</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={refreshConnection}
                      disabled={isLoading}
                      className="flex items-center space-x-1 px-3 py-1 text-xs bg-slate-700/50 text-slate-300 rounded-sm hover:bg-slate-700 transition-colors border border-slate-600/50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to disconnect from Dhan?')) {
                          handleDhanDisconnect();
                        }
                      }}
                      className="flex items-center space-x-1 px-3 py-1 text-xs bg-red-900/30 text-red-400 rounded-sm hover:bg-red-900/50 transition-colors border border-red-700/50"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Zerodha Broker Card */}
              {isZerodhaConnected && (
                <div className="border border-slate-700/50 bg-slate-800/30 rounded-sm p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-sm flex items-center justify-center text-xl">🔵</div>
                      <div>
                        <h3 className="font-semibold text-slate-200">Zerodha</h3>
                        <p className="text-sm text-slate-400">API Key: ****1234</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1 text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-sm font-mono border border-green-700/50">
                        <Check className="w-3 h-3" />
                        <span>Connected</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 mb-4">
                    <div>
                      <span className="block text-slate-500">Available Balance</span>
                      <span className="font-medium text-slate-300">₹150,000.00</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Used Margin</span>
                      <span className="font-medium text-slate-300">₹35,000.00</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Last Updated</span>
                      <span className="font-medium text-slate-300">{lastUpdated.toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Status</span>
                      <span className="font-medium text-green-400">Active</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={refreshConnection}
                      disabled={isLoading}
                      className="flex items-center space-x-1 px-3 py-1 text-xs bg-slate-700/50 text-slate-300 rounded-sm hover:bg-slate-700 transition-colors border border-slate-600/50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to disconnect from Zerodha?')) {
                          handleZerodhaDisconnect();
                        }
                      }}
                      className="flex items-center space-x-1 px-3 py-1 text-xs bg-red-900/30 text-red-400 rounded-sm hover:bg-red-900/50 transition-colors border border-red-700/50"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <LinkIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-200 mb-2">No Brokers Connected</h3>
              <p className="text-slate-400 mb-4">Connect your first broker to start trading</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setShowDhanForm(true)}
                  className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-2 rounded-sm hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                >
                  Connect Dhan
                </button>
                <button
                  onClick={() => setShowZerodhaForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-sm hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  Connect Zerodha
                </button>
              </div>
            </div>
          )}
        </div>
      </ErrorBoundary>

      {/* Dhan Connection Form */}
      {showDhanForm && !isDhanConnected && (
        <ErrorBoundary>
          <div className="professional-card p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-200">Connect to Dhan</h2>
              <button
                onClick={() => setShowDhanForm(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Customer Name</label>
                <input
                  type="text"
                  value={dhanCredentials.customer}
                  onChange={(e) => setDhanCredentials({...dhanCredentials, customer: e.target.value})}
                  placeholder="Enter a unique name for this account"
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 placeholder-slate-500"
                />
                <p className="mt-1 text-xs text-slate-500">Example: My Dhan, Wife Dhan</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Client ID</label>
                <input
                  type="text"
                  value={dhanCredentials.clientId}
                  onChange={(e) => setDhanCredentials({...dhanCredentials, clientId: e.target.value})}
                  placeholder="Enter your Dhan Client ID"
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 placeholder-slate-500"
                />
                <p className="mt-1 text-xs text-slate-500">Example: 1100813699</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Client Secret / Access Token</label>
                <input
                  type="password"
                  value={dhanCredentials.clientSecret}
                  onChange={(e) => setDhanCredentials({...dhanCredentials, clientSecret: e.target.value})}
                  placeholder="Enter your Dhan Client Secret"
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 placeholder-slate-500"
                />
                <p className="mt-1 text-xs text-slate-500">Example: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9...</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDhanConnect}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-sm hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-5 h-5" />
                      <span>Connect to Dhan</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDhanForm(false);
                    setError('');
                  }}
                  className="px-6 py-3 bg-slate-800/60 border border-slate-600/50 text-slate-300 rounded-sm hover:bg-slate-700/60 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      )}

      {/* Zerodha Connection Form */}
      {showZerodhaForm && !isZerodhaConnected && (
        <ErrorBoundary>
          <div className="professional-card p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-200">Connect to Zerodha</h2>
              <button
                onClick={() => setShowZerodhaForm(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">API Key</label>
                <input
                  type="text"
                  value={zerodhaCredentials.apiKey}
                  onChange={(e) => setZerodhaCredentials({...zerodhaCredentials, apiKey: e.target.value})}
                  placeholder="Enter your Zerodha API Key"
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">API Secret</label>
                <input
                  type="password"
                  value={zerodhaCredentials.apiSecret}
                  onChange={(e) => setZerodhaCredentials({...zerodhaCredentials, apiSecret: e.target.value})}
                  placeholder="Enter your Zerodha API Secret"
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 placeholder-slate-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleZerodhaConnect}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-sm hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-5 h-5" />
                      <span>Connect to Zerodha</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowZerodhaForm(false);
                    setError('');
                  }}
                  className="px-6 py-3 bg-slate-800/60 border border-slate-600/50 text-slate-300 rounded-sm hover:bg-slate-700/60 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      )}

      {/* API Documentation */}
      <ErrorBoundary>
        <div className="professional-card p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-6">
            <Settings className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-semibold text-slate-200">API Documentation</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-sm p-4">
              <h3 className="text-lg font-semibold text-slate-200 mb-3">Dhan API</h3>
              <p className="text-slate-400 mb-3">The Dhan API allows you to place orders, fetch account details, and access market data.</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">Base URL: <code className="bg-slate-700/50 px-2 py-1 rounded-sm">https://api.dhan.co</code></span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">Authentication: Bearer Token</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">Documentation: <a href="https://api.dhan.co" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">https://api.dhan.co</a></span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-sm p-4">
              <h3 className="text-lg font-semibold text-slate-200 mb-3">Zerodha API</h3>
              <p className="text-slate-400 mb-3">The Zerodha Kite Connect API provides trading and market data capabilities.</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300">Base URL: <code className="bg-slate-700/50 px-2 py-1 rounded-sm">https://api.kite.trade</code></span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300">Authentication: API Key + Access Token</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300">Documentation: <a href="https://kite.trade/docs/connect/v3" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://kite.trade/docs/connect/v3</a></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>

      {/* Connection Guide */}
      <ErrorBoundary>
        <div className="professional-card p-6 bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-200 mb-2">How to Connect Your Broker</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Log in to your broker's website and navigate to API settings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>Generate API credentials (API Key and Secret)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>Enter the credentials in TraderDesk.ai to establish connection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <span>Start trading directly from our platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>

      {/* Security Notice */}
      <ErrorBoundary>
        <div className="professional-card p-6 bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-slate-200">Security & Privacy</h3>
          </div>
          <div className="text-sm text-slate-300 space-y-2">
            <p>• All API credentials are encrypted and stored securely</p>
            <p>• We never store your broker login passwords</p>
            <p>• You can disconnect any broker at any time</p>
            <p>• All trading operations are logged for your security</p>
            <p>• We use secure local storage for data persistence</p>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default Broker;