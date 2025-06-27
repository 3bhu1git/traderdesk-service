import React, { useState, useEffect } from 'react';
import { Check, Loader, Shield, RefreshCw, Settings, X, Plus, Database, CreditCard, Edit3, Trash2, Star, Search, Power } from 'lucide-react';
import BrokerService, { BrokerConnection, TradingAccount, TradingAccountData } from '../services/brokerService';
import { useNotifications } from '../context/NotificationContext';

const Broker: React.FC = () => {
  const { showSuccess, showError } = useNotifications();
  const [activeTab, setActiveTab] = useState<'data' | 'trading'>('data');
  
  // Data Integration State
  const [isDhanConnected, setIsDhanConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDhanForm, setShowDhanForm] = useState(false);
  const [dhanCredentials, setDhanCredentials] = useState({
    customer: '',
    clientId: '',
    accessToken: ''
  });
  
  // Trading Accounts State
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);
  const [showTradingForm, setShowTradingForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [masterLiveToggle, setMasterLiveToggle] = useState(false);
  const availableTags = [
    'Personal', 'Business', 'Testing', 'Production', 'Demo', 'Family', 'Investment', 'Trading', 'Swing', 'Intraday'
  ];
  const [tradingAccountForm, setTradingAccountForm] = useState<TradingAccountData>({
    brokerName: '',
    accountName: '',
    accountId: '',
    accountType: 'Combined',
    accessToken: '',
    tags: [],
    isLive: false
  });

  // Check connections on component mount
  useEffect(() => {
    checkConnections();
    loadTradingAccounts();
  }, []);

  const checkConnections = async () => {
    setIsLoading(true);
    try {
      // Check from localStorage first
      const localStorageConnected = BrokerService.isDhanConnected();
      
      // Get stored credentials if available
      const storedCredentials = BrokerService.getDhanCredentials();
      if (storedCredentials) {
        setDhanCredentials({
          customer: storedCredentials.customer || '',
          clientId: storedCredentials.clientId,
          accessToken: '********' // Mask the token
        });
      } else {
        setDhanCredentials({
          customer: '',
          clientId: '',
          accessToken: ''
        });
      }

      // Fetch from backend to get the real status
      const result = await BrokerService.getBrokerConnections();
      
      if (result.success && result.data?.connections) {
        // Update Dhan connection status based on backend data
        const dhanConnection = result.data.connections.find((conn: BrokerConnection) => 
          conn.brokerName === 'Dhan'
        );
        const backendConnected = !!dhanConnection;
        
        // Set connection status based on backend data (more reliable)
        setIsDhanConnected(backendConnected);

        // If backend says not connected but localStorage says connected, clean up localStorage
        if (!backendConnected && localStorageConnected) {
          localStorage.removeItem('dhanCredentials');
        }
      } else {
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

  // Load trading accounts and update master toggle state
  const loadTradingAccounts = async () => {
    try {
      const result = await BrokerService.getTradingAccounts();
      if (result.success) {
        const accounts = result.data?.accounts || [];
        setTradingAccounts(accounts);
        
        // Update master toggle based on accounts - true if ANY account is live
        const anyLive = accounts.length > 0 && accounts.some((account: TradingAccount) => account.isLive);
        setMasterLiveToggle(anyLive);
      } else {
        console.error('Failed to load trading accounts:', result.message);
      }
    } catch (error) {
      console.error('Error loading trading accounts:', error);
    }
  };

  // Master toggle handler
  const handleMasterLiveToggle = async () => {
    const newState = !masterLiveToggle;
    setMasterLiveToggle(newState);
    
    try {
      // Update all accounts with optimistic UI
      setTradingAccounts(prev => 
        prev.map(account => ({ ...account, isLive: newState }))
      );

      // Update each account in the backend
      const updatePromises = tradingAccounts.map(account => 
        BrokerService.updateTradingAccount(account.id, { isLive: newState })
      );
      
      const results = await Promise.all(updatePromises);
      const failedUpdates = results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        showError('Update Failed', `Failed to update ${failedUpdates.length} account(s)`);
        // Reload to get accurate state
        await loadTradingAccounts();
      } else {
        showSuccess('Success', `All accounts ${newState ? 'enabled for' : 'disabled from'} live trading`);
      }
    } catch (error) {
      showError('Update Failed', 'Failed to update accounts. Please try again.');
      // Revert master toggle and reload accounts
      setMasterLiveToggle(!newState);
      await loadTradingAccounts();
    }
  };

  // Filter accounts based on search
  const filteredAccounts = tradingAccounts.filter(account => 
    account.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.brokerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.accountId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (account.tags && account.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleDhanConnect = async () => {
    if (!dhanCredentials.clientId || !dhanCredentials.accessToken) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await BrokerService.connectDhan({
        clientId: dhanCredentials.clientId,
        accessToken: dhanCredentials.accessToken,
        customer: dhanCredentials.customer
      });

      if (result.success) {
        showSuccess('Connection Successful', 'Successfully connected to Dhan broker!');
        setIsDhanConnected(true);
        setShowDhanForm(false);
        setDhanCredentials({
          customer: dhanCredentials.customer,
          clientId: dhanCredentials.clientId,
          accessToken: '********' // Mask the token after success
        });
      } else {
        showError('Connection Failed', result.message || 'Failed to connect to Dhan broker');
      }
    } catch (error) {
      console.error('Dhan connect error:', error);
      showError('Connection Failed', 'Failed to connect to Dhan broker. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDhanDisconnect = async () => {
    setIsLoading(true);

    try {
      const result = await BrokerService.disconnectDhan();
      
      if (result.success) {
        showSuccess('Disconnection Successful', 'Successfully disconnected from Dhan broker');
        setIsDhanConnected(false);
        setDhanCredentials({
          customer: '',
          clientId: '',
          accessToken: ''
        });
      } else {
        showError('Disconnection Failed', result.message || 'Failed to disconnect from Dhan broker');
      }
    } catch (error) {
      console.error('Dhan disconnect error:', error);
      showError('Disconnection Failed', 'Failed to disconnect from Dhan broker. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLiveTrading = async (accountId: string, currentLiveStatus: boolean) => {
    try {
      // Optimistically update the UI
      setTradingAccounts(prev => 
        prev.map(account => 
          account.id === accountId 
            ? { ...account, isLive: !currentLiveStatus }
            : account
        )
      );

      const result = await BrokerService.updateTradingAccount(accountId, { 
        isLive: !currentLiveStatus 
      });
      
      if (result.success) {
        showSuccess('Status Updated', `Account ${!currentLiveStatus ? 'enabled for' : 'disabled from'} live trading`);
        
        // Refresh trading accounts to ensure consistency and update master toggle
        await loadTradingAccounts();
      } else {
        // Revert optimistic update on failure
        setTradingAccounts(prev => 
          prev.map(account => 
            account.id === accountId 
              ? { ...account, isLive: currentLiveStatus }
              : account
          )
        );
        showError('Update Failed', result.message || 'Failed to update live trading status');
      }
    } catch (error) {
      // Revert optimistic update on error
      setTradingAccounts(prev => 
        prev.map(account => 
          account.id === accountId 
            ? { ...account, isLive: currentLiveStatus }
            : account
        )
      );
      console.error('Toggle live trading error:', error);
      showError('Update Failed', 'Failed to update live trading status. Please try again.');
    }
  };

  const handleAddTradingAccount = async () => {
    if (!tradingAccountForm.brokerName || !tradingAccountForm.accountName || !tradingAccountForm.accountId || !tradingAccountForm.accessToken) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await BrokerService.addTradingAccount(tradingAccountForm);
      
      if (result.success) {
        showSuccess('Account Added', 'Trading account added successfully!');
        setShowTradingForm(false);
        resetForm();
        await loadTradingAccounts();
      } else {
        showError('Add Failed', result.message || 'Failed to add trading account');
      }
    } catch (error) {
      console.error('Add trading account error:', error);
      showError('Add Failed', 'Failed to add trading account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTradingAccount = async () => {
    if (!editingAccount || !tradingAccountForm.brokerName || !tradingAccountForm.accountName || !tradingAccountForm.accountId || !tradingAccountForm.accessToken) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await BrokerService.updateTradingAccount(editingAccount.id, tradingAccountForm);
      
      if (result.success) {
        showSuccess('Account Updated', 'Trading account updated successfully!');
        setShowTradingForm(false);
        setEditingAccount(null);
        resetForm();
        await loadTradingAccounts();
      } else {
        showError('Update Failed', result.message || 'Failed to update trading account');
      }
    } catch (error) {
      console.error('Update trading account error:', error);
      showError('Update Failed', 'Failed to update trading account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTradingAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this trading account?')) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await BrokerService.deleteTradingAccount(accountId);
      
      if (result.success) {
        showSuccess('Account Deleted', 'Trading account deleted successfully');
        await loadTradingAccounts();
      } else {
        showError('Delete Failed', result.message || 'Failed to delete trading account');
      }
    } catch (error) {
      console.error('Delete trading account error:', error);
      showError('Delete Failed', 'Failed to delete trading account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPrimaryTradingAccount = async (accountId: string) => {
    setIsLoading(true);

    try {
      const result = await BrokerService.setPrimaryTradingAccount(accountId);
      
      if (result.success) {
        showSuccess('Primary Account Set', 'Primary trading account updated successfully');
        await loadTradingAccounts();
      } else {
        showError('Update Failed', result.message || 'Failed to set primary trading account');
      }
    } catch (error) {
      console.error('Set primary trading account error:', error);
      showError('Update Failed', 'Failed to set primary trading account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditingAccount = (account: TradingAccount) => {
    setEditingAccount(account);
    setTradingAccountForm({
      brokerName: account.brokerName,
      accountName: account.accountName,
      accountId: account.accountId,
      accountType: account.accountType,
      accessToken: account.accessToken,
      tags: account.tags || [],
      isLive: account.isLive
    });
    setShowTradingForm(true);
  };

  const resetForm = () => {
    setTradingAccountForm({
      brokerName: '',
      accountName: '',
      accountId: '',
      accountType: 'Combined',
      accessToken: '',
      tags: [],
      isLive: false
    });
    setEditingAccount(null);
    setTagInput('');
  };

  const cancelForm = () => {
    setShowTradingForm(false);
    setShowDhanForm(false);
    resetForm();
  };

  const addTag = (tag: string) => {
    if (tag && !tradingAccountForm.tags?.includes(tag)) {
      setTradingAccountForm(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTradingAccountForm(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const brokerOptions = ['Dhan', 'Zerodha', 'Upstox', 'AngelOne', 'Groww', 'ICICI Direct', 'HDFC Securities', 'Kotak Securities'];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="professional-card p-4 md:p-6 bg-slate-800/50 border border-slate-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-3 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">Broker Integration</h1>
              <p className="text-slate-400 text-sm md:text-base">Connect your trading accounts and manage broker integrations</p>
            </div>
            <div className="flex items-center space-x-2 self-start md:self-auto">
              <Settings className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-slate-700/30 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('data')}
              className={`flex-1 flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 md:py-3 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'data'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Database className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Data Integration</span>
              <span className="sm:hidden">Data</span>
            </button>
            <button
              onClick={() => setActiveTab('trading')}
              className={`flex-1 flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 md:py-3 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'trading'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <CreditCard className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Trading Accounts</span>
              <span className="sm:hidden">Trading</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="professional-card p-6 bg-slate-800/30 border border-slate-700/50">
          {activeTab === 'data' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-200">Data Integration</h2>
                  <p className="text-sm text-slate-400">Connect brokers for real-time market data and analytics</p>
                </div>
                <button
                  onClick={checkConnections}
                  disabled={isLoading}
                  className="p-2 hover:bg-slate-700 rounded-sm transition-colors"
                  title="Refresh connection status"
                >
                  <RefreshCw className={`w-5 h-5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Dhan Integration */}
              <div className="space-y-4">
                <div className={`border rounded-sm p-4 ${isDhanConnected ? 'border-green-700/50 bg-green-900/20' : 'border-slate-700/50 bg-slate-800/30'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-500 rounded-sm flex items-center justify-center">
                        <span className="text-white font-bold text-xs">DHAN</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-200">Dhan Securities</h3>
                        <p className="text-sm text-slate-400">Real-time data, charts & analytics</p>
                        {isDhanConnected && dhanCredentials.clientId && (
                          <p className="text-sm text-green-400">Client ID: {dhanCredentials.clientId}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-2 px-3 py-2 rounded-sm text-sm ${
                        isDhanConnected 
                          ? 'bg-green-900/30 border border-green-700/50 text-green-300' 
                          : 'bg-slate-700/30 border border-slate-600/50 text-slate-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${isDhanConnected ? 'bg-green-400' : 'bg-slate-500'}`}></div>
                        <span>{isDhanConnected ? 'Connected' : 'Disconnected'}</span>
                      </div>
                      {isDhanConnected ? (
                        <button
                          onClick={handleDhanDisconnect}
                          disabled={isLoading}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm transition-colors disabled:opacity-50"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowDhanForm(true)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-sm font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-200"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dhan Connection Form */}
                {showDhanForm && (
                  <div className="border border-slate-700/50 rounded-sm p-6 bg-slate-800/30">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-200">Connect to Dhan</h3>
                        <p className="text-sm text-slate-400">Enter your Dhan API credentials to enable data integration</p>
                      </div>
                      <button
                        onClick={cancelForm}
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
                          placeholder="Your name or identifier"
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
                          onClick={cancelForm}
                          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'trading' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 space-y-3 md:space-y-0">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-slate-200">Trading Accounts</h2>
                  <p className="text-xs md:text-sm text-slate-400">Manage accounts for order execution and live trading</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  {/* Master Live Toggle */}
                  {tradingAccounts.length > 0 && (
                    <div className="flex items-center space-x-2 px-2 md:px-3 py-1.5 md:py-2 bg-slate-800/50 border border-slate-600/50 rounded-sm">
                      <span className="text-xs md:text-sm text-slate-300 whitespace-nowrap">Master Live:</span>
                      <div className="relative" title={`${masterLiveToggle ? 'Disable' : 'Enable'} all accounts for live trading`}>
                        <input
                          type="checkbox"
                          id="master-live-toggle"
                          checked={masterLiveToggle}
                          onChange={handleMasterLiveToggle}
                          className="sr-only"
                        />
                        <label
                          htmlFor="master-live-toggle"
                          className={`relative inline-flex items-center h-5 w-9 md:h-6 md:w-11 rounded-full cursor-pointer transition-all duration-200 ${
                            masterLiveToggle
                              ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-500/25'
                              : 'bg-slate-600'
                          }`}
                        >
                          <span
                            className={`inline-block w-3 h-3 md:w-4 md:h-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                              masterLiveToggle ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </label>
                      </div>
                      <Power className={`w-3 h-3 md:w-4 md:h-4 ${masterLiveToggle ? 'text-green-400' : 'text-slate-400'}`} />
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowTradingForm(true)}
                    className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-sm font-semibold hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 text-sm md:text-base"
                  >
                    <Plus className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Add Account</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>

              {/* Search Box */}
              {tradingAccounts.length > 1 && (
                <div className="mb-4 md:mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search accounts by name, broker, ID, or tags..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 placeholder-slate-500"
                    />
                  </div>
                </div>
              )}

              {/* Trading Accounts List */}
              {filteredAccounts.length > 0 ? (
                <div className="space-y-4">
                  {filteredAccounts.map((account) => (
                    <div key={account.id} className={`p-3 md:p-4 border rounded-sm ${account.isPrimary ? 'border-green-700/50 bg-green-900/20' : 'border-slate-700/50 bg-slate-800/30'} hover:border-slate-600/50 transition-colors`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-sm flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs">{account.brokerName.slice(0, 3).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h4 className="font-semibold text-slate-200 text-sm md:text-base truncate">{account.accountName}</h4>
                              {account.isPrimary && (
                                <div className="flex items-center space-x-1 px-1.5 md:px-2 py-0.5 md:py-1 bg-green-900/30 border border-green-700/50 rounded-sm">
                                  <Star className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-400" />
                                  <span className="text-xs text-green-300">Primary</span>
                                </div>
                              )}
                              {account.isLive && (
                                <div className="flex items-center space-x-1 px-1.5 md:px-2 py-0.5 md:py-1 bg-green-900/30 border border-green-700/50 rounded-sm">
                                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className="text-xs text-green-300">Live</span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs md:text-sm text-slate-400 mb-1">{account.brokerName} • {account.accountType}</p>
                            <p className="text-xs md:text-sm text-slate-400 mb-2 truncate">ID: {account.accountId}</p>
                            {account.accessToken && (
                              <p className="text-xs md:text-sm text-slate-400 mb-2">API: Connected</p>
                            )}
                            {account.tags && account.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {account.tags.map((tag, index) => (
                                  <span key={index} className="inline-block px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-900/30 border border-blue-700/50 rounded-sm text-xs text-blue-300">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end space-x-2">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {!account.isPrimary && (
                              <button
                                onClick={() => handleSetPrimaryTradingAccount(account.id)}
                                className="p-1.5 md:p-2 hover:bg-slate-700 rounded-sm transition-colors text-slate-400 hover:text-green-400"
                                title="Set as primary"
                              >
                                <Star className="w-3 h-3 md:w-4 md:h-4" />
                              </button>
                            )}
                            
                            {/* Live Trading Toggle */}
                            <div className="relative" title={`${account.isLive ? 'Disable' : 'Enable'} live trading`}>
                              <input
                                type="checkbox"
                                id={`live-${account.id}`}
                                checked={account.isLive}
                                onChange={() => handleToggleLiveTrading(account.id, account.isLive)}
                                className="sr-only"
                              />
                              <label
                                htmlFor={`live-${account.id}`}
                                className={`relative inline-flex items-center h-4 w-7 md:h-5 md:w-9 rounded-full cursor-pointer transition-all duration-200 ${
                                  account.isLive
                                    ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-md shadow-green-500/25'
                                  : 'bg-slate-600 hover:bg-slate-500'
                              }`}
                            >
                              <span
                                className={`inline-block w-2.5 h-2.5 md:w-3 md:h-3 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                  account.isLive ? 'translate-x-3.5 md:translate-x-5' : 'translate-x-0.5 md:translate-x-1'
                                }`}
                              />
                            </label>
                          </div>
                          </div>

                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() => startEditingAccount(account)}
                              className="p-1.5 md:p-2 hover:bg-slate-700 rounded-sm transition-colors text-slate-400 hover:text-blue-400"
                              title="Edit account"
                            >
                              <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTradingAccount(account.id)}
                              className="p-1.5 md:p-2 hover:bg-slate-700 rounded-sm transition-colors text-slate-400 hover:text-red-400"
                              title="Delete account"
                            >
                              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : tradingAccounts.length > 0 && searchQuery ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">No accounts found</h3>
                  <p className="text-slate-400 mb-4">No trading accounts match your search criteria</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-sm transition-colors"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">No Trading Accounts</h3>
                  <p className="text-slate-400 mb-6">Add your trading accounts to execute trades</p>
                  <button
                    onClick={() => setShowTradingForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-sm font-semibold hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                  >
                    Add Trading Account
                  </button>
                </div>
              )}

              {/* Trading Account Form */}
              {showTradingForm && (
                <div className="border border-slate-700/50 rounded-sm p-6 bg-slate-800/30 mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200">
                        {editingAccount ? 'Edit Trading Account' : 'Add Trading Account'}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {editingAccount ? 'Update your trading account details' : 'Add a new trading account for order execution'}
                      </p>
                    </div>
                    <button
                      onClick={cancelForm}
                      className="p-2 hover:bg-slate-800 rounded-sm transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Broker Name <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={tradingAccountForm.brokerName}
                          onChange={(e) => setTradingAccountForm({...tradingAccountForm, brokerName: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                        >
                          <option value="">Select Broker</option>
                          {brokerOptions.map((broker) => (
                            <option key={broker} value={broker}>{broker}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Account Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={tradingAccountForm.accountName}
                          onChange={(e) => setTradingAccountForm({...tradingAccountForm, accountName: e.target.value})}
                          placeholder="e.g., My Trading Account"
                          className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 placeholder-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Account ID <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={tradingAccountForm.accountId}
                          onChange={(e) => setTradingAccountForm({...tradingAccountForm, accountId: e.target.value})}
                          placeholder="Your broker account ID"
                          className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 placeholder-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Access Token <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="password"
                          value={tradingAccountForm.accessToken}
                          onChange={(e) => setTradingAccountForm({...tradingAccountForm, accessToken: e.target.value})}
                          placeholder="Your broker API access token (required)"
                          className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 placeholder-slate-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">Required for automated trading via API</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Tags
                        </label>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {tradingAccountForm.tags?.map((tag, index) => (
                              <span key={index} className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-900/30 border border-blue-700/50 rounded-sm text-xs text-blue-300">
                                <span>{tag}</span>
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="text-blue-400 hover:text-blue-300 ml-1"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyPress={handleTagInputKeyPress}
                              placeholder="Add a tag (e.g., Personal, Production)"
                              className="flex-1 px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 placeholder-slate-500"
                            />
                            <button
                              type="button"
                              onClick={() => addTag(tagInput.trim())}
                              disabled={!tagInput.trim()}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded-sm transition-colors"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {availableTags.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => addTag(tag)}
                                disabled={tradingAccountForm.tags?.includes(tag)}
                                className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-300 rounded-sm transition-colors"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Account Type
                        </label>
                        <select
                          value={tradingAccountForm.accountType}
                          onChange={(e) => setTradingAccountForm({...tradingAccountForm, accountType: e.target.value as 'Trading' | 'Demat' | 'Combined'})}
                          className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                        >
                          <option value="Combined">Combined (Trading + Demat)</option>
                          <option value="Trading">Trading Only</option>
                          <option value="Demat">Demat Only</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Live Trading
                        </label>
                        <div className="flex items-center space-x-3 p-3 bg-slate-800/60 border border-slate-600/50 rounded-sm">
                          <div className="relative">
                            <input
                              type="checkbox"
                              id="isLive"
                              checked={tradingAccountForm.isLive || false}
                              onChange={(e) => setTradingAccountForm({...tradingAccountForm, isLive: e.target.checked})}
                              className="sr-only"
                            />
                            <label
                              htmlFor="isLive"
                              className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-all duration-200 ${
                                tradingAccountForm.isLive
                                  ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-500/25'
                                  : 'bg-slate-600'
                              }`}
                            >
                              <span
                                className={`inline-block w-4 h-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                                  tradingAccountForm.isLive ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </label>
                          </div>
                          <div>
                            <label htmlFor="isLive" className="text-sm text-slate-200 cursor-pointer">
                              Enable live trading for this account
                            </label>
                            <p className="text-xs text-slate-500 mt-1">
                              When enabled, this account will participate in live trading sessions
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={editingAccount ? handleUpdateTradingAccount : handleAddTradingAccount}
                        disabled={isLoading || !tradingAccountForm.brokerName || !tradingAccountForm.accountName || !tradingAccountForm.accountId || !tradingAccountForm.accessToken}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-sm font-semibold hover:from-blue-700 hover:to-blue-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>{editingAccount ? 'Update Account' : 'Add Account'}</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={cancelForm}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Security Notice */}
      <div className="professional-card p-6 bg-slate-800/30 border border-slate-700/50">
        <div className="flex items-center space-x-2 mb-3">
          <Shield className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-slate-200">Security & Privacy</h3>
        </div>
        <div className="text-sm text-slate-300 space-y-2">
          <p>• All API credentials and account details are encrypted and stored securely</p>
          <p>• We never store your trading passwords or login credentials</p>
          <p>• You can disconnect brokers and remove accounts at any time</p>
          <p>• All trading operations require your explicit authorization</p>
        </div>
      </div>
    </div>
  );
};

export default Broker;
