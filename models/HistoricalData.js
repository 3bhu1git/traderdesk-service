const mongoose = require('mongoose');

const historicalDataSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        required: true,
        index: true
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
});

// Compound index for efficient querying
historicalDataSchema.index({ symbol: 1, timestamp: 1 });

module.exports = mongoose.model('HistoricalData', historicalDataSchema); 