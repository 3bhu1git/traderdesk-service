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

module.exports = {
  connectDhan,
  disconnectDhan,
  getBrokerConnections,
  setPrimaryBroker
};
