const User = require('../models/User');
const logger = require('../utils/logger');
const axios = require('axios');

/**
 * Connect to Dhan broker
 */
const connectDhan = async (req, res) => {
  try {
    console.log('[BrokerController] connectDhan called with body:', req.body);
    
    const userId = req.user.userId;
    const { clientId, accessToken, customer } = req.body;

    if (!clientId || !accessToken) {
      console.log('[BrokerController] Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Client ID and Access Token are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('[BrokerController] User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('[BrokerController] Testing Dhan API connection...');
    
    // Test Dhan API connection
    try {
      const dhanResponse = await axios.get('https://api.dhan.co/v2/fundlimit', {
        headers: {
          'access-token': accessToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (dhanResponse.status === 200) {
        // Remove existing Dhan account if any
        user.brokerAccounts = user.brokerAccounts.filter(account => account.brokerName !== 'Dhan');
        
        // Add new Dhan account
        const brokerAccount = {
          brokerName: 'Dhan',
          accountId: clientId,
          apiKey: clientId,
          accessToken: accessToken,
          isPrimary: user.brokerAccounts.length === 0, // Set as primary if it's the first account
          customer: customer || 'Dhan User'
        };

        user.brokerAccounts.push(brokerAccount);
        await user.save();

        logger.info(`Dhan broker connected for user: ${userId}, clientId: ${clientId}`);

        res.status(200).json({
          success: true,
          message: 'Successfully connected to Dhan broker',
          data: {
            broker: 'Dhan',
            clientId: clientId,
            customer: customer || 'Dhan User',
            status: 'connected',
            connectedAt: new Date().toISOString()
          }
        });
      } else {
        throw new Error('Invalid Dhan API response');
      }
    } catch (apiError) {
      logger.error('Dhan API authentication failed:', apiError.response?.data || apiError.message);
      
      // Return specific error message based on API response
      let errorMessage = 'Failed to connect to Dhan. Please check your credentials.';
      if (apiError.response?.status === 401) {
        errorMessage = 'Invalid Client ID or Access Token. Please verify your credentials.';
      } else if (apiError.response?.status === 403) {
        errorMessage = 'Access denied. Please check if your Dhan account has API access enabled.';
      }
      
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }

  } catch (error) {
    logger.error('Error connecting Dhan broker:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while connecting to Dhan'
    });
  }
};

/**
 * Disconnect from Dhan broker
 */
const disconnectDhan = async (req, res) => {
  try {
    console.log('[BrokerController] disconnectDhan called');
    
    const userId = req.user.userId;
    console.log('[BrokerController] User ID:', userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log('[BrokerController] User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('[BrokerController] Current broker accounts:', user.brokerAccounts.length);
    
    // Remove Dhan account
    const originalCount = user.brokerAccounts.length;
    user.brokerAccounts = user.brokerAccounts.filter(account => account.brokerName !== 'Dhan');
    const newCount = user.brokerAccounts.length;
    
    console.log('[BrokerController] Removed accounts:', originalCount - newCount);
    
    await user.save();

    logger.info(`Dhan broker disconnected for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Successfully disconnected from Dhan broker'
    });

  } catch (error) {
    console.error('[BrokerController] Error disconnecting Dhan broker:', error);
    logger.error('Error disconnecting Dhan broker:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while disconnecting from Dhan'
    });
  }
};

/**
 * Get broker connections
 */
const getBrokerConnections = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('brokerAccounts');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const connections = user.brokerAccounts.map(account => ({
      id: account._id,
      brokerName: account.brokerName,
      accountId: account.accountId,
      isPrimary: account.isPrimary,
      status: 'connected',
      connectedAt: account.createdAt,
      customer: account.customer || account.brokerName + ' User'
    }));

    res.status(200).json({
      success: true,
      data: {
        connections,
        totalConnections: connections.length
      }
    });

  } catch (error) {
    logger.error('Error fetching broker connections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch broker connections'
    });
  }
};

/**
 * Set primary broker account
 */
const setPrimaryBroker = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'Account ID is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the account to set as primary
    const account = user.brokerAccounts.find(acc => acc._id.toString() === accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Broker account not found'
      });
    }

    // Reset all accounts to non-primary
    user.brokerAccounts.forEach(acc => {
      acc.isPrimary = false;
    });

    // Set the specified account as primary
    account.isPrimary = true;
    await user.save();

    logger.info(`Primary broker set for user: ${userId}, accountId: ${accountId}`);

    res.status(200).json({
      success: true,
      message: 'Primary broker account updated successfully'
    });

  } catch (error) {
    logger.error('Error setting primary broker:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set primary broker account'
    });
  }
};

/**
 * Add a new trading account
 */
const addTradingAccount = async (req, res) => {
  try {
    console.log('[BrokerController] addTradingAccount called with body:', req.body);
    
    const userId = req.user.userId;
    const { 
      brokerName, 
      accountName, 
      accountId, 
      accountType, 
      apiKey, 
      accessToken, 
      balance, 
      notes 
    } = req.body;

    if (!brokerName || !accountName || !accountId) {
      console.log('[BrokerController] Missing required fields for trading account');
      return res.status(400).json({
        success: false,
        message: 'Broker name, account name, and account ID are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('[BrokerController] User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if account already exists
    const existingAccount = user.tradingAccounts.find(
      account => account.accountId === accountId && account.brokerName === brokerName
    );
    
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Trading account already exists'
      });
    }

    const tradingAccountData = {
      brokerName,
      accountName,
      accountId,
      accountType: accountType || 'Combined',
      apiKey: apiKey || '',
      accessToken: accessToken || '',
      balance: balance || 0,
      notes: notes || '',
      isActive: true
    };

    await user.addTradingAccount(tradingAccountData);

    logger.info(`Trading account added for user: ${userId}, broker: ${brokerName}, accountId: ${accountId}`);

    res.status(201).json({
      success: true,
      message: 'Trading account added successfully',
      data: {
        accountId,
        brokerName,
        accountName,
        accountType: tradingAccountData.accountType
      }
    });

  } catch (error) {
    logger.error('Error adding trading account:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while adding trading account'
    });
  }
};

/**
 * Get all trading accounts
 */
const getTradingAccounts = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('tradingAccounts');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const accounts = user.tradingAccounts.map(account => ({
      id: account._id,
      brokerName: account.brokerName,
      accountName: account.accountName,
      accountId: account.accountId,
      accountType: account.accountType,
      isActive: account.isActive,
      isPrimary: account.isPrimary,
      isLive: account.isLive || false,
      accessToken: account.accessToken,
      tags: account.tags || [],
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        accounts,
        totalAccounts: accounts.length
      }
    });

  } catch (error) {
    logger.error('Error fetching trading accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trading accounts'
    });
  }
};

/**
 * Update a trading account
 */
const updateTradingAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { accountId } = req.params;
    const updateData = req.body;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'Account ID is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const account = user.tradingAccounts.find(acc => acc._id.toString() === accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Trading account not found'
      });
    }

    await user.updateTradingAccount(accountId, updateData);

    logger.info(`Trading account updated for user: ${userId}, accountId: ${accountId}`);

    res.status(200).json({
      success: true,
      message: 'Trading account updated successfully'
    });

  } catch (error) {
    logger.error('Error updating trading account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update trading account'
    });
  }
};

/**
 * Delete a trading account
 */
const deleteTradingAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { accountId } = req.params;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'Account ID is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const account = user.tradingAccounts.find(acc => acc._id.toString() === accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Trading account not found'
      });
    }

    await user.removeTradingAccount(accountId);

    logger.info(`Trading account deleted for user: ${userId}, accountId: ${accountId}`);

    res.status(200).json({
      success: true,
      message: 'Trading account deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting trading account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete trading account'
    });
  }
};

/**
 * Set primary trading account
 */
const setPrimaryTradingAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'Account ID is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const account = user.tradingAccounts.find(acc => acc._id.toString() === accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Trading account not found'
      });
    }

    await user.setPrimaryTradingAccount(accountId);

    logger.info(`Primary trading account set for user: ${userId}, accountId: ${accountId}`);

    res.status(200).json({
      success: true,
      message: 'Primary trading account updated successfully'
    });

  } catch (error) {
    logger.error('Error setting primary trading account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set primary trading account'
    });
  }
};

/**
 * Toggle live trading status for a specific trading account
 */
const toggleAccountLiveStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { accountId } = req.params;
    const { isLive } = req.body;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'Account ID is required'
      });
    }

    if (typeof isLive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isLive must be a boolean value'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const account = user.tradingAccounts.find(acc => acc._id.toString() === accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Trading account not found'
      });
    }

    // Update the live status
    account.isLive = isLive;
    account.updatedAt = new Date();
    
    await user.save();

    const statusText = isLive ? 'enabled for live trading' : 'disabled from live trading';
    
    logger.info(`Trading account ${account.accountName} ${statusText} for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: `Account ${statusText} successfully`,
      data: {
        accountId: account._id,
        accountName: account.accountName,
        isLive: account.isLive
      }
    });

  } catch (error) {
    logger.error('Error toggling account live status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update account live status'
    });
  }
};

/**
 * Bulk update live trading status for all trading accounts
 */
const bulkToggleLiveStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { isLive } = req.body;

    if (typeof isLive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isLive must be a boolean value'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.tradingAccounts || user.tradingAccounts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No trading accounts found'
      });
    }

    // Update all accounts
    let updatedCount = 0;
    user.tradingAccounts.forEach(account => {
      if (account.isLive !== isLive) {
        account.isLive = isLive;
        account.updatedAt = new Date();
        updatedCount++;
      }
    });

    await user.save();

    const statusText = isLive ? 'enabled for live trading' : 'disabled from live trading';
    
    logger.info(`${updatedCount} trading accounts ${statusText} for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: `All accounts ${statusText} successfully`,
      data: {
        totalAccounts: user.tradingAccounts.length,
        updatedAccounts: updatedCount,
        liveAccountsCount: user.tradingAccounts.filter(acc => acc.isLive).length
      }
    });

  } catch (error) {
    logger.error('Error bulk toggling live status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update accounts live status'
    });
  }
};

/**
 * Add a new data broker connection
 */
const addDataBrokerConnection = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { brokerName, connectionName, clientId, accessToken } = req.body;

    if (!brokerName || !connectionName || !clientId || !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: brokerName, connectionName, clientId, accessToken'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Test connection first (example for Dhan)
    if (brokerName === 'Dhan') {
      try {
        const dhanResponse = await axios.get('https://api.dhan.co/v2/fundlimit', {
          headers: {
            'access-token': accessToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (dhanResponse.status !== 200) {
          return res.status(400).json({
            success: false,
            message: 'Failed to connect to Dhan. Please check your credentials.'
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Dhan credentials or API connection failed'
        });
      }
    }

    // Check if this is the first broker account
    const isFirstAccount = user.brokerAccounts.length === 0;

    // Create new broker account
    const newBrokerAccount = {
      brokerName,
      connectionName,
      accountId: clientId, // Using clientId as accountId for data connections
      clientId,
      accessToken,
      isPrimary: isFirstAccount, // First account becomes primary automatically
      isActive: isFirstAccount, // Only first account is active by default, others are inactive
      lastConnected: isFirstAccount ? new Date() : null
    };

    user.brokerAccounts.push(newBrokerAccount);
    await user.save();

    logger.info(`Data broker connection added for user: ${userId}, broker: ${brokerName}`);

    res.status(201).json({
      success: true,
      message: `${brokerName} data connection added successfully`,
      data: {
        connectionId: newBrokerAccount._id,
        brokerName,
        connectionName,
        isPrimary: newBrokerAccount.isPrimary
      }
    });

  } catch (error) {
    logger.error('Error adding data broker connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add data broker connection'
    });
  }
};

/**
 * Get all data broker connections
 */
const getDataBrokerConnections = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const connections = user.brokerAccounts.map(account => ({
      id: account._id,
      brokerName: account.brokerName,
      connectionName: account.connectionName,
      accountId: account.accountId,
      clientId: account.clientId,
      isPrimary: account.isPrimary,
      isActive: account.isActive,
      lastConnected: account.lastConnected,
      createdAt: account.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        connections: connections
      }
    });

  } catch (error) {
    logger.error('Error fetching data broker connections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch data broker connections'
    });
  }
};

/**
 * Set primary data broker connection
 */
const setPrimaryDataBroker = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { connectionId } = req.body;

    if (!connectionId) {
      return res.status(400).json({
        success: false,
        message: 'Connection ID is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the connection to be set as primary
    const targetConnection = user.brokerAccounts.find(acc => acc._id.toString() === connectionId);
    if (!targetConnection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    // First, deactivate all connections and unset primary flags
    user.brokerAccounts.forEach(account => {
      account.isPrimary = false;
      account.isActive = false;
    });

    // Set the target connection as primary and active
    targetConnection.isPrimary = true;
    targetConnection.isActive = true;
    targetConnection.lastConnected = new Date();

    await user.save();

    logger.info(`Primary data broker set and activated for user: ${userId}, connectionId: ${connectionId}`);

    res.status(200).json({
      success: true,
      message: 'Primary data broker connection updated and activated successfully',
      data: {
        connectionId: targetConnection._id,
        brokerName: targetConnection.brokerName,
        connectionName: targetConnection.connectionName,
        isPrimary: true,
        isActive: true
      }
    });

  } catch (error) {
    logger.error('Error setting primary data broker:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to set primary data broker'
    });
  }
};

/**
 * Toggle live data integration
 */
const toggleLiveDataIntegration = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'enabled must be a boolean value'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (enabled) {
      // When enabling live data:
      // 1. Check if user has a primary broker account
      const primaryAccount = user.getPrimaryAccount();
      if (!primaryAccount) {
        return res.status(400).json({
          success: false,
          message: 'Please set a primary data broker connection first'
        });
      }

      // 2. Check if any connection is already active
      const hasActiveConnection = user.brokerAccounts.some(account => account.isActive);
      
      if (!hasActiveConnection) {
        // 3. Activate the primary connection if none is active
        primaryAccount.isActive = true;
        primaryAccount.lastConnected = new Date();
      }

      user.liveDataEnabled = true;
    } else {
      // When disabling live data:
      // 1. Disconnect all data broker connections
      user.brokerAccounts.forEach(account => {
        account.isActive = false;
      });

      user.liveDataEnabled = false;
    }

    await user.save();

    logger.info(`Live data integration ${enabled ? 'enabled' : 'disabled'} for user: ${userId}`);

    // Get updated primary account and active connections count
    const activeConnectionsCount = user.brokerAccounts.filter(account => account.isActive).length;

    res.status(200).json({
      success: true,
      message: `Live data integration ${enabled ? 'enabled' : 'disabled'} successfully`,
      data: {
        liveDataEnabled: user.liveDataEnabled,
        primaryBroker: user.getPrimaryAccount(),
        activeConnectionsCount,
        hasActiveConnections: activeConnectionsCount > 0
      }
    });

  } catch (error) {
    logger.error('Error toggling live data integration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle live data integration'
    });
  }
};

/**
 * Get live data integration status
 */
const getLiveDataStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const primaryBroker = user.getPrimaryAccount();
    const activeConnectionsCount = user.brokerAccounts.filter(account => account.isActive).length;
    const hasActiveConnections = activeConnectionsCount > 0;

    res.status(200).json({
      success: true,
      data: {
        enabled: hasActiveConnections, // Status based on active connections, not just the flag
        liveDataEnabled: user.liveDataEnabled || false, // The user's preference setting
        primaryBroker: primaryBroker,
        activeConnectionsCount,
        hasActiveConnections
      }
    });

  } catch (error) {
    logger.error('Error getting live data status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get live data status'
    });
  }
};

/**
 * Delete data broker connection
 */
const deleteDataBrokerConnection = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { connectionId } = req.params;

    if (!connectionId) {
      return res.status(400).json({
        success: false,
        message: 'Connection ID is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const connectionIndex = user.brokerAccounts.findIndex(acc => acc._id.toString() === connectionId);
    if (connectionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Data broker connection not found'
      });
    }

    const wasLiveDataEnabled = user.liveDataEnabled;
    const wasPrimary = user.brokerAccounts[connectionIndex].isPrimary;

    // Remove the connection
    user.brokerAccounts.splice(connectionIndex, 1);

    // If this was the primary connection and there are other connections, set a new primary
    if (wasPrimary && user.brokerAccounts.length > 0) {
      user.brokerAccounts[0].isPrimary = true;
    }

    // If this was the primary connection and live data was enabled, disable it
    if (wasPrimary && wasLiveDataEnabled) {
      user.liveDataEnabled = false;
    }

    await user.save();

    logger.info(`Data broker connection deleted for user: ${userId}, connectionId: ${connectionId}`);

    res.status(200).json({
      success: true,
      message: 'Data broker connection deleted successfully',
      data: {
        liveDataEnabled: user.liveDataEnabled
      }
    });

  } catch (error) {
    logger.error('Error deleting data broker connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete data broker connection'
    });
  }
};

/**
 * Connect a specific data broker connection (set as active)
 */
const connectDataBrokerConnection = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { connectionId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the connection to activate
    const connectionToActivate = user.brokerAccounts.id(connectionId);
    if (!connectionToActivate) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    // Deactivate all other connections
    user.brokerAccounts.forEach(account => {
      account.isActive = false;
    });

    // Activate the selected connection
    connectionToActivate.isActive = true;
    connectionToActivate.lastConnected = new Date();

    // Set as primary if no primary is set
    if (!user.brokerAccounts.some(acc => acc.isPrimary)) {
      connectionToActivate.isPrimary = true;
    }

    // Enable live data integration
    user.liveDataEnabled = true;

    await user.save();

    logger.info(`Data broker connection activated: ${connectionId} for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Data broker connection activated successfully',
      data: {
        connectionId,
        isActive: true,
        liveDataEnabled: user.liveDataEnabled
      }
    });

  } catch (error) {
    logger.error('Error connecting data broker connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect data broker connection'
    });
  }
};

/**
 * Disconnect a specific data broker connection (set as inactive)
 */
const disconnectDataBrokerConnection = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { connectionId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the connection to deactivate
    const connectionToDeactivate = user.brokerAccounts.id(connectionId);
    if (!connectionToDeactivate) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    // Deactivate the connection
    connectionToDeactivate.isActive = false;

    // If this was the only active connection, disable live data
    const hasActiveConnections = user.brokerAccounts.some(acc => acc.isActive);
    if (!hasActiveConnections) {
      user.liveDataEnabled = false;
    }

    await user.save();

    logger.info(`Data broker connection deactivated: ${connectionId} for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Data broker connection deactivated successfully',
      data: {
        connectionId,
        isActive: false,
        liveDataEnabled: user.liveDataEnabled
      }
    });

  } catch (error) {
    logger.error('Error disconnecting data broker connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect data broker connection'
    });
  }
};

module.exports = {
  connectDhan,
  disconnectDhan,
  getBrokerConnections,
  setPrimaryBroker,
  addTradingAccount,
  getTradingAccounts,
  updateTradingAccount,
  deleteTradingAccount,
  setPrimaryTradingAccount,
  toggleAccountLiveStatus,
  bulkToggleLiveStatus,
  addDataBrokerConnection,
  getDataBrokerConnections,
  setPrimaryDataBroker,
  toggleLiveDataIntegration,
  getLiveDataStatus,
  deleteDataBrokerConnection,
  connectDataBrokerConnection,
  disconnectDataBrokerConnection,
  connectDataBrokerConnection,
  disconnectDataBrokerConnection
};
