const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    symbol: {
        type: String,
        required: true,
        index: true
    },
    exchange: {
        type: String,
        required: true,
        enum: ['NSE', 'BSE']
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    transactionType: {
        type: String,
        required: true,
        enum: ['BUY', 'SELL']
    },
    orderType: {
        type: String,
        required: true,
        enum: ['MARKET', 'LIMIT', 'SL', 'SL-M']
    },
    productType: {
        type: String,
        required: true,
        enum: ['CNC', 'MIS', 'NRML']
    },
    price: {
        type: Number,
        required: function() {
            return this.orderType === 'LIMIT' || this.orderType === 'SL';
        }
    },
    triggerPrice: {
        type: Number,
        required: function() {
            return this.orderType === 'SL' || this.orderType === 'SL-M';
        }
    },
    status: {
        type: String,
        required: true,
        enum: [
            'PENDING',
            'OPEN',
            'EXECUTED',
            'CANCELLED',
            'REJECTED',
            'MODIFIED'
        ],
        default: 'PENDING'
    },
    filledQuantity: {
        type: Number,
        default: 0
    },
    averagePrice: {
        type: Number
    },
    rejectionReason: String,
    exchangeOrderId: String,
    exchangeTimestamp: Date,
    validity: {
        type: String,
        enum: ['DAY', 'IOC', 'GTD'],
        default: 'DAY'
    },
    validityDate: {
        type: Date,
        required: function() {
            return this.validity === 'GTD';
        }
    },
    orderTimestamp: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    tags: [String],
    notes: String
}, {
    timestamps: true
});

// Indexes for efficient querying
OrderSchema.index({ symbol: 1, orderTimestamp: -1 });
OrderSchema.index({ status: 1, orderTimestamp: -1 });

// Pre-save middleware to update lastModified
OrderSchema.pre('save', function(next) {
    this.lastModified = new Date();
    next();
});

// Instance methods
OrderSchema.methods.cancel = async function() {
    if (this.status === 'EXECUTED' || this.status === 'CANCELLED') {
        throw new Error(`Cannot cancel order in ${this.status} status`);
    }
    this.status = 'CANCELLED';
    return this.save();
};

OrderSchema.methods.modify = async function(modifications) {
    if (this.status !== 'OPEN') {
        throw new Error(`Cannot modify order in ${this.status} status`);
    }
    
    Object.assign(this, modifications);
    this.status = 'MODIFIED';
    return this.save();
};

// Static methods
OrderSchema.statics.findByDateRange = async function(startDate, endDate) {
    return this.find({
        orderTimestamp: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ orderTimestamp: -1 });
};

OrderSchema.statics.findActiveOrders = async function() {
    return this.find({
        status: { $in: ['PENDING', 'OPEN', 'MODIFIED'] }
    }).sort({ orderTimestamp: -1 });
};

OrderSchema.statics.findBySymbol = async function(symbol) {
    return this.find({ symbol })
        .sort({ orderTimestamp: -1 });
};

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;