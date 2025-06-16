const Order = require('../models/order');
const { validateOrder } = require('../utils/validators');

// Create a new order
exports.createOrder = async (req, res) => {
    const { error } = validateOrder(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const order = new Order({
        symbol: req.body.symbol,
        quantity: req.body.quantity,
        transactionType: req.body.transactionType,
        orderType: req.body.orderType,
        productType: req.body.productType,
        price: req.body.price,
    });

    try {
        const savedOrder = await order.save();
        res.status(201).send(savedOrder);
    } catch (err) {
        res.status(500).send('Error creating order: ' + err.message);
    }
};

// Update an existing order
exports.updateOrder = async (req, res) => {
    const { orderId } = req.params;
    const { error } = validateOrder(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, { new: true });
        if (!updatedOrder) return res.status(404).send('Order not found');
        res.send(updatedOrder);
    } catch (err) {
        res.status(500).send('Error updating order: ' + err.message);
    }
};

// Cancel an existing order
exports.cancelOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) return res.status(404).send('Order not found');
        res.send('Order canceled successfully');
    } catch (err) {
        res.status(500).send('Error canceling order: ' + err.message);
    }
};

// Get live status of a specific order
exports.getOrderStatus = async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).send('Order not found');
        res.send(order);
    } catch (err) {
        res.status(500).send('Error retrieving order status: ' + err.message);
    }
};