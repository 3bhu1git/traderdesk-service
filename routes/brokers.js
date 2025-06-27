const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  connectDhan,
  disconnectDhan,
  getBrokerConnections,
  setPrimaryBroker
} = require('../controllers/brokerController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Dhan broker routes
router.post('/dhan/connect', connectDhan);
router.post('/dhan/disconnect', disconnectDhan);

// General broker routes
router.get('/connections', getBrokerConnections);
router.put('/primary', setPrimaryBroker);

module.exports = router;
