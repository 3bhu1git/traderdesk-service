const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  connectDhan,
  disconnectDhan,
  getBrokerConnections,
  setPrimaryBroker,
  addTradingAccount,
  getTradingAccounts,
  updateTradingAccount,
  deleteTradingAccount,
  setPrimaryTradingAccount
} = require('../controllers/brokerController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Dhan broker routes (for data integration)
router.post('/dhan/connect', connectDhan);
router.post('/dhan/disconnect', disconnectDhan);

// General broker routes (for data integration)
router.get('/connections', getBrokerConnections);
router.put('/primary', setPrimaryBroker);

// Trading account routes (separate from data integration)
router.post('/trading-accounts', addTradingAccount);
router.get('/trading-accounts', getTradingAccounts);
router.put('/trading-accounts/:accountId', updateTradingAccount);
router.delete('/trading-accounts/:accountId', deleteTradingAccount);
router.put('/trading-accounts/primary', setPrimaryTradingAccount);

module.exports = router;
