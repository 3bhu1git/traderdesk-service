import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Check, AlertCircle, Loader, Shield, RefreshCw, Settings, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrokerService, { BrokerConnection, DhanCredentials } from '../services/brokerService';

const Broker: React.FC = () => {
  const { user } = useAuth();
  const [isDhanConnected, setIsDhanConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDhanForm, setShowDhanForm] = useState(false);
  const [dhanCredentials, setDhanCredentials] = useState({
    customer: '',
    clientId: '',
    accessToken: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [connections, setConnections] = useState<BrokerConnection[]>([]);

  // Check broker connections on component mount
  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    console.log('[Broker] checkConnections called');
    setIsLoading(true);
    try {
      // Check from localStorage first
      const localStorageConnected = BrokerService.isDhanConnected();
      console.log('[Broker] localStorage connected:', localStorageConnected);
      
      // Get stored credentials if available
      const storedCredentials = BrokerService.getDhanCredentials();
      if (storedCredentials) {
        console.log('[Broker] Found stored credentials for client:', storedCredentials.clientId);
        setDhanCredentials({
          customer: storedCredentials.customer || '',
          clientId: storedCredentials.clientId,
          accessToken: '********' // Mask the token
        });
      } else {
        console.log('[Broker] No stored credentials found');
        setDhanCredentials({
          customer: '',
          clientId: '',
          accessToken: ''
        });
      }

      // Fetch from backend to get the real status
      console.log('[Broker] Fetching connections from backend...');
      const result = await BrokerService.getBrokerConnections();
      console.log('[Broker] Backend connections result:', result);
      
      if (result.success && result.data?.connections) {
        setConnections(result.data.connections);
        
        // Update Dhan connection status based on backend data
        const dhanConnection = result.data.connections.find((conn: BrokerConnection) => 
          conn.brokerName === 'Dhan'
        );
        const backendConnected = !!dhanConnection;
        console.log('[Broker] Backend Dhan connected:', backendConnected);
        
        // Set connection status based on backend data (more reliable)
        setIsDhanConnected(backendConnected);
        
        // If backend says not connected but localStorage says connected, clean up localStorage
        if (!backendConnected && localStorageConnected) {
          console.log('[Broker] Cleaning up stale localStorage data');
          localStorage.removeItem('dhanCredentials');
        }
      } else {
        console.log('[Broker] Failed to fetch backend connections or no connections found');
        // If we can't reach backend, fall back to localStorage status
        setIsDhanConnected(localStorageConnected);
      }
    } catch (error) {
      console.error('[Broker] Error checking connections:', error);
      // On error, fall back to localStorage status
      setIsDhanConnected(BrokerService.isDhanConnected());
    } finally {
      setIsLoading(false);
    }
  };

  const handleDhanConnect = async () => {
    if (!dhanCredentials.clientId || !dhanCredentials.accessToken) {
      setError('Please enter both Client ID and Access Token');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await BrokerService.connectDhan({
        clientId: dhanCredentials.clientId,
        accessToken: dhanCredentials.accessToken,
        customer: dhanCredentials.customer || 'Dhan User'
      });

      if (result.success) {
        setSuccess('Successfully connected to Dhan broker!');
        setIsDhanConnected(true);
        setShowDhanForm(false);
        
        // Refresh connections
        await checkConnections();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to connect to Dhan broker');
      }
    } catch (error) {
      console.error('Dhan connection error:', error);
      setError('Failed to connect to Dhan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDhanDisconnect = async () => {
    console.log('[Broker] handleDhanDisconnect called');
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('[Broker] Calling BrokerService.disconnectDhan()');
      const result = await BrokerService.disconnectDhan();
      console.log('[Broker] Disconnect result:', result);
      
      if (result.success) {
        console.log('[Broker] Disconnect successful');
        setSuccess('Successfully disconnected from Dhan broker');
        setIsDhanConnected(false);
        setDhanCredentials({
          customer: '',
          clientId: '',
          accessToken: ''
        });
        
        // Refresh connections
        await checkConnections();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        console.log('[Broker] Disconnect failed:', result.message);
        setError(result.message || 'Failed to disconnect from Dhan broker');
      }
    } catch (error) {
      console.error('[Broker] Dhan disconnection error:', error);
      setError('Failed to disconnect from Dhan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConnections = async () => {
    await checkConnections();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Broker Integration</h1>
          <p className="text-slate-400 mt-1">Connect your trading accounts for seamless execution</p>
        </div>
        <button
          onClick={refreshConnections}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-sm hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="professional-card p-4 border border-green-700/50 bg-green-900/20">
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-300">Success</h3>
              <p className="text-sm text-green-300/80 mt-1">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="professional-card p-4 border border-red-700/50 bg-red-900/20">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-300">Connection Error</h3>
              <p className="text-sm text-red-300/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Connected Brokers */}
      <div className="professional-card p-6 border border-slate-700/50">
        <div className="flex items-center space-x-2 mb-6">
          <LinkIcon className="w-5 h-5 text-green-400" />
          <h2 className="text-xl font-semibold text-slate-200">Connected Brokers</h2>
        </div>

        {isDhanConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-700/30 rounded-sm">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-500 rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DHAN</span>
                </div>
                <div>
                  <h3 className="font-semibold text-green-300">Dhan Securities</h3>
                  <p className="text-sm text-green-300/80">Client ID: {dhanCredentials.clientId}</p>
                  <p className="text-sm text-green-300/80">Status: Connected</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <button
                  onClick={handleDhanDisconnect}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Disconnect'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <LinkIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No Brokers Connected</h3>
            <p className="text-slate-400 mb-6">Connect your trading accounts to start trading</p>
            <button
              onClick={() => setShowDhanForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-sm font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
            >
              Connect Dhan Broker
            </button>
          </div>
        )}
      </div>

      {/* Dhan Connection Form */}
      {showDhanForm && !isDhanConnected && (
        <div className="professional-card p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-xs">DHAN</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200">Connect Dhan Securities</h3>
                <p className="text-sm text-slate-400">Enter your Dhan API credentials</p>
              </div>
            </div>
            <button
              onClick={() => setShowDhanForm(false)}
              className="p-2 hover:bg-slate-800 rounded-sm transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={dhanCredentials.customer}
                onChange={(e) => setDhanCredentials({...dhanCredentials, customer: e.target.value})}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Client ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={dhanCredentials.clientId}
                onChange={(e) => setDhanCredentials({...dhanCredentials, clientId: e.target.value})}
                placeholder="Enter your Dhan Client ID"
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Access Token <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={dhanCredentials.accessToken}
                onChange={(e) => setDhanCredentials({...dhanCredentials, accessToken: e.target.value})}
                placeholder="Enter your Dhan Access Token"
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 placeholder-slate-500"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleDhanConnect}
                disabled={isLoading || !dhanCredentials.clientId || !dhanCredentials.accessToken}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-sm font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Connect to Dhan</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDhanForm(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Documentation */}
      <div className="professional-card p-6 border border-slate-700/50">
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="w-5 h-5 text-green-400" />
          <h2 className="text-xl font-semibold text-slate-200">API Setup Guide</h2>
        </div>
        
        <div className="space-y-4">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-sm p-4">
            <h3 className="font-semibold text-slate-200 mb-2">Dhan Securities Setup</h3>
            <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
              <li>Log in to your Dhan trading account</li>
              <li>Go to API section in settings</li>
              <li>Generate or copy your Client ID and Access Token</li>
              <li>Enter the credentials above to connect</li>
            </ol>
            <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-sm">
              <p className="text-sm text-yellow-300">
                <Shield className="w-4 h-4 inline mr-2" />
                Your credentials are stored securely and encrypted.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="professional-card p-6 bg-slate-800/30 border border-slate-700/50">
        <div className="flex items-center space-x-2 mb-3">
          <Shield className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-slate-200">Security & Privacy</h3>
        </div>
        <div className="text-sm text-slate-300 space-y-2">
          <p>• All API credentials are encrypted and stored securely</p>
          <p>• We never store your trading passwords</p>
          <p>• You can disconnect brokers at any time</p>
          <p>• All trading operations require your explicit authorization</p>
        </div>
      </div>
    </div>
  );
};

export default Broker;
