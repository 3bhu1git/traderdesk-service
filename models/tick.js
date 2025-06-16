const mongoose = require('mongoose');

const tickSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  volume: {
    type: Number,
    required: true,
  },
  bid: {
    type: Number,
    required: true,
  },
  ask: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Tick', tickSchema);