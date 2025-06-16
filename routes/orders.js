const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

// Create a new order
router.post('/', ordersController.createOrder);

// Modify an existing order
router.put('/:orderId', ordersController.updateOrder);

// Cancel an existing order
router.delete('/:orderId', ordersController.cancelOrder);

// Get live status of a specific order
router.get('/:orderId', ordersController.getOrderStatus);

module.exports = router;