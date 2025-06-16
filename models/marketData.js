const mongoose = require('mongoose');

// Schema for OHLC data
const OHLCSchema = new mongoose.Schema({
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
    timeframe: {
        type: String,
        required: true,
        enum: ['1m', '5m', '15m', '30m', '1h', '1d']
    },
    timestamp: {
        type: Date,
        required: true
    },
    open: {
        type: Number,
        required: true
    },
    high: {
        type: Number,
        required: true
    },
    low: {
        type: Number,
        required: true
    },
    close: {
        type: Number,
        required: true
    },
    volume: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create compound index for efficient querying
OHLCSchema.index({ symbol: 1, timeframe: 1, timestamp: 1 }, { unique: true });

// Schema for tick data
const TickSchema = new mongoose.Schema({
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
    timestamp: {
        type: Date,
        required: true
    },
    lastPrice: {
        type: Number,
        required: true
    },
    lastQuantity: {
        type: Number,
        required: true
    },
    volume: {
        type: Number,
        required: true
    },
    bidPrice: Number,
    bidQuantity: Number,
    askPrice: Number,
    askQuantity: Number,
    openInterest: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create compound index for tick data
TickSchema.index({ symbol: 1, timestamp: 1 }, { unique: true });

// Methods for OHLC model
OHLCSchema.statics.findBySymbolAndTimeRange = async function(symbol, timeframe, startDate, endDate) {
    return this.find({
        symbol,
        timeframe,
        timestamp: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ timestamp: 1 });
};

// Methods for Tick model
TickSchema.statics.findLatestTicks = async function(symbol, limit = 100) {
    return this.find({ symbol })
        .sort({ timestamp: -1 })
        .limit(limit);
};

const OHLC = mongoose.model('OHLC', OHLCSchema);
const Tick = mongoose.model('Tick', TickSchema);

module.exports = {
    OHLC,
    Tick
};