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
  disconnectDataBrokerConnection
} = require('../controllers/brokerController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Data integration routes (multiple broker connections)
router.post('/data-connections', addDataBrokerConnection);
router.get('/data-connections', getDataBrokerConnections);
router.put('/data-connections/primary', setPrimaryDataBroker);
router.put('/data-connections/:connectionId/connect', connectDataBrokerConnection);
router.put('/data-connections/:connectionId/disconnect', disconnectDataBrokerConnection);
router.delete('/data-connections/:connectionId', deleteDataBrokerConnection);
router.put('/live-data/toggle', toggleLiveDataIntegration);
router.get('/live-data/status', getLiveDataStatus);

// Legacy Dhan broker routes (for backward compatibility)
router.post('/dhan/connect', connectDhan);
router.post('/dhan/disconnect', disconnectDhan);

// General broker routes (legacy)
router.get('/connections', getBrokerConnections);
router.put('/primary', setPrimaryBroker);

// Trading account routes (separate from data integration)
router.post('/trading-accounts', addTradingAccount);
router.get('/trading-accounts', getTradingAccounts);
router.put('/trading-accounts/:accountId', updateTradingAccount);
router.delete('/trading-accounts/:accountId', deleteTradingAccount);
router.put('/trading-accounts/primary', setPrimaryTradingAccount);

// Live trading toggle routes
router.put('/trading-accounts/bulk/live-status', bulkToggleLiveStatus);
router.put('/trading-accounts/:accountId/live-status', toggleAccountLiveStatus);

module.exports = router;
