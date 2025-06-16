const mongoose = require('mongoose');

// Schema for holdings (delivery positions)
const HoldingSchema = new mongoose.Schema({
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
        min: 0
    },
    averageCost: {
        type: Number,
        required: true
    },
    lastPrice: {
        type: Number,
        required: true
    },
    currentValue: {
        type: Number,
        required: true
    },
    pnl: {
        type: Number,
        required: true
    },
    pnlPercentage: {
        type: Number,
        required: true
    },
    collateralQuantity: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Schema for intraday positions
const PositionSchema = new mongoose.Schema({
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
    productType: {
        type: String,
        required: true,
        enum: ['MIS', 'NRML']
    },
    quantity: {
        type: Number,
        required: true
    },
    buyQuantity: {
        type: Number,
        default: 0
    },
    sellQuantity: {
        type: Number,
        default: 0
    },
    buyValue: {
        type: Number,
        default: 0
    },
    sellValue: {
        type: Number,
        default: 0
    },
    buyAverage: {
        type: Number
    },
    sellAverage: {
        type: Number
    },
    lastPrice: {
        type: Number,
        required: true
    },
    mtm: {
        type: Number,
        required: true
    },
    realizedPnl: {
        type: Number,
        default: 0
    },
    unrealizedPnl: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Methods for Holdings
HoldingSchema.methods.updateValue = function(lastPrice) {
    this.lastPrice = lastPrice;
    this.currentValue = this.quantity * lastPrice;
    this.pnl = this.currentValue - (this.quantity * this.averageCost);
    this.pnlPercentage = (this.pnl / (this.quantity * this.averageCost)) * 100;
    this.lastUpdated = new Date();
    return this.save();
};

// Methods for Positions
PositionSchema.methods.updateMTM = function(lastPrice) {
    this.lastPrice = lastPrice;
    
    // Calculate unrealized P&L
    if (this.quantity > 0) {
        this.unrealizedPnl = (lastPrice - this.buyAverage) * this.quantity;
    } else if (this.quantity < 0) {
        this.unrealizedPnl = (this.sellAverage - lastPrice) * Math.abs(this.quantity);
    }

    this.mtm = this.realizedPnl + this.unrealizedPnl;
    this.lastUpdated = new Date();
    return this.save();
};

// Static methods for Holdings
HoldingSchema.statics.getTotalPortfolioValue = async function() {
    const holdings = await this.find();
    return holdings.reduce((total, holding) => total + holding.currentValue, 0);
};

// Static methods for Positions
PositionSchema.statics.getTotalMTM = async function() {
    const positions = await this.find();
    return positions.reduce((total, position) => total + position.mtm, 0);
};

const Holding = mongoose.model('Holding', HoldingSchema);
const Position = mongoose.model('Position', PositionSchema);

module.exports = {
    Holding,
    Position
};