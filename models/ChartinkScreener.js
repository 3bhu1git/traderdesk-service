const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chartinkScreenerSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  description: {
    type: String,
    trim: true,
    maxLength: 500
  },
  chartinkUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/(www\.)?chartink\.com\/screener\/.*/.test(v);
      },
      message: 'Must be a valid Chartink screener URL'
    }
  },
  triggerTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Trigger time must be in HH:MM format (24-hour)'
    }
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    default: 'daily'
  },
  customFrequency: {
    type: {
      interval: {
        type: Number,
        min: 1
      },
      unit: {
        type: String,
        enum: ['minutes', 'hours', 'days']
      }
    },
    required: function() {
      return this.frequency === 'custom';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRun: {
    type: Date,
    default: null
  },
  nextRun: {
    type: Date,
    default: null
  },
  runCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const screenerResultSchema = new Schema({
  screenerId: {
    type: Schema.Types.ObjectId,
    ref: 'ChartinkScreener',
    required: true
  },
  results: [{
    symbol: {
      type: String,
      required: true
    },
    exchange: {
      type: String,
      required: true
    },
    ltp: {
      type: Number
    },
    volume: {
      type: Number
    },
    change: {
      type: Number
    },
    changePercent: {
      type: Number
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  }],
  totalResults: {
    type: Number,
    default: 0
  },
  runAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['success', 'error', 'partial'],
    default: 'success'
  },
  errorMessage: {
    type: String
  }
});

// Update the updatedAt field before saving
chartinkScreenerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate next run time
chartinkScreenerSchema.methods.calculateNextRun = function() {
  const now = new Date();
  const [hours, minutes] = this.triggerTime.split(':').map(Number);
  
  let nextRun = new Date();
  nextRun.setHours(hours, minutes, 0, 0);
  
  switch (this.frequency) {
    case 'daily':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
    case 'weekly':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 7);
      }
      break;
    case 'monthly':
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
      break;
    case 'custom':
      if (this.customFrequency) {
        const { interval, unit } = this.customFrequency;
        if (nextRun <= now) {
          switch (unit) {
            case 'minutes':
              nextRun.setMinutes(nextRun.getMinutes() + interval);
              break;
            case 'hours':
              nextRun.setHours(nextRun.getHours() + interval);
              break;
            case 'days':
              nextRun.setDate(nextRun.getDate() + interval);
              break;
          }
        }
      }
      break;
  }
  
  this.nextRun = nextRun;
  return nextRun;
};

// Index for efficient queries
chartinkScreenerSchema.index({ createdBy: 1 });
chartinkScreenerSchema.index({ nextRun: 1, isActive: 1 });
screenerResultSchema.index({ screenerId: 1, runAt: -1 });

const ChartinkScreener = mongoose.model('ChartinkScreener', chartinkScreenerSchema);
const ScreenerResult = mongoose.model('ScreenerResult', screenerResultSchema);

module.exports = {
  ChartinkScreener,
  ScreenerResult
};