const express = require('express');
const router = express.Router();
const BrokerPanel = require('../views/BrokerPanel');
const { validateApiKey, validateToken } = require('../middleware/security');

// Apply security middleware to all routes
router.use(validateApiKey);
router.use(validateToken);

// Add new broker account
router.post('/add', async (req, res) => {
  try {
    const { userId, accountData } = req.body;
    const brokerPanel = new BrokerPanel(userId);
    const result = await brokerPanel.addBrokerAccount(accountData);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add Dhan connection
router.post('/dhan', async (req, res) => {
  try {
    const { userId, clientId, apiKey, accessToken } = req.body;
    const brokerPanel = new BrokerPanel(userId);
    const result = await brokerPanel.addDhanConnection({ 
      clientId, 
      apiKey, 
      accessToken 
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Set primary account
router.put('/primary', async (req, res) => {
  try {
    const { userId, accountId } = req.body;
    const brokerPanel = new BrokerPanel(userId);
    const result = await brokerPanel.setPrimaryAccount(accountId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all broker accounts
router.get('/list', async (req, res) => {
  try {
    const { userId } = req.query;
    const brokerPanel = new BrokerPanel(userId);
    const result = await brokerPanel.render();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Debug: Log every /brokers POST request
router.post('/brokers', async (req, res) => {
  console.log('POST /api/brokers called. Body:', req.body);
  try {
    // Accepts: { broker, customer, credentials }
    const { broker, customer, credentials } = req.body;
    if (!broker || !customer || !credentials) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // For demo, use a dummy userId (replace with real auth in production)
    const userId = req.user ? req.user.id : 'dummy-user-id';
    if (broker === 'dhan') {
      const brokerPanel = new BrokerPanel(userId);
      // Save Dhan connection (apiKey is optional for now)
      const result = await brokerPanel.addDhanConnection({
        clientId: credentials.clientId,
        apiKey: credentials.apiKey || '',
        accessToken: credentials.accessToken
      });
      return res.status(201).json({ success: true, account: result });
    }
    // Add more brokers as needed
    return res.status(400).json({ error: 'Unsupported broker' });
  } catch (error) {
    console.error('Error in /api/brokers:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Explicitly handle OPTIONS for CORS preflight on /brokers
router.options('/brokers', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Dhan-Client-Id, x-client-id');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

module.exports = router;