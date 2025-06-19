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

module.exports = router;