const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const brokerAccountSchema = new Schema({
  brokerName: {
    type: String,
    required: true,
    enum: ['Dhan', 'Zerodha', 'Upstox', 'AngelOne', 'Groww']
  },
  connectionName: {
    type: String,
    required: true // User-friendly name for the connection
  },
  accountId: {
    type: String,
    required: true
  },
  clientId: {
    type: String,
    required: true // For API connections
  },
  accessToken: {
    type: String,
    required: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true // Whether this connection is currently active
  },
  lastConnected: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const tradingAccountSchema = new Schema({
  brokerName: {
    type: String,
    required: true,
    enum: ['Dhan', 'Zerodha', 'Upstox', 'AngelOne', 'Groww', 'ICICI Direct', 'HDFC Securities', 'Kotak Securities']
  },
  accountName: {
    type: String,
    required: true
  },
  accountId: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    required: false // Some brokers might not need API key for trading
  },
  accessToken: {
    type: String,
    required: true // Required for API-based trading
  },
  tags: {
    type: [String],
    default: [] // Array of tags for categorizing accounts
  },
  accountType: {
    type: String,
    enum: ['Trading', 'Demat', 'Combined'],
    default: 'Combined'
  },
  balance: {
    type: Number,
    default: 0 // Account balance for display purposes
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  isLive: {
    type: Boolean,
    default: false // Whether this account participates in live trading
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

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loginMethod: {
    type: String,
    enum: ['phone', 'google', 'email'],
    default: 'phone'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  tradingExperience: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional'],
    required: false
  },
  tradingStyle: {
    type: String,
    enum: ['Day Trading', 'Swing Trading', 'Position Trading', 'Scalping'],
    required: false
  },
  brokerAccounts: [brokerAccountSchema],
  tradingAccounts: [tradingAccountSchema],
  // Data integration settings
  liveDataEnabled: {
    type: Boolean,
    default: false // Master switch for live data integration
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to get primary account
userSchema.methods.getPrimaryAccount = function() {
  return this.brokerAccounts.find(account => account.isPrimary);
};

// Method to get primary trading account
userSchema.methods.getPrimaryTradingAccount = function() {
  return this.tradingAccounts.find(account => account.isPrimary);
};

// Method to set primary account
userSchema.methods.setPrimaryAccount = function(accountId) {
  // Reset all accounts to non-primary
  this.brokerAccounts.forEach(account => {
    account.isPrimary = false;
  });
  
  // Set the specified account as primary
  const account = this.brokerAccounts.find(acc => acc.accountId === accountId);
  if (account) {
    account.isPrimary = true;
  }
  
  return this.save();
};

// Method to set primary trading account
userSchema.methods.setPrimaryTradingAccount = function(accountId) {
  // Reset all trading accounts to non-primary
  this.tradingAccounts.forEach(account => {
    account.isPrimary = false;
  });
  
  // Set the specified account as primary
  const account = this.tradingAccounts.find(acc => acc._id.toString() === accountId);
  if (account) {
    account.isPrimary = true;
  }
  
  return this.save();
};

// Method to add new broker account
userSchema.methods.addBrokerAccount = function(accountData) {
  // If this is the first account, set as primary
  if (this.brokerAccounts.length === 0) {
    accountData.isPrimary = true;
  }
  
  this.brokerAccounts.push(accountData);
  return this.save();
};

// Method to add new trading account
userSchema.methods.addTradingAccount = function(accountData) {
  // If this is the first trading account, set as primary
  if (this.tradingAccounts.length === 0) {
    accountData.isPrimary = true;
  }
  
  accountData.updatedAt = new Date();
  this.tradingAccounts.push(accountData);
  return this.save();
};

// Method to update trading account
userSchema.methods.updateTradingAccount = function(accountId, updateData) {
  const account = this.tradingAccounts.find(acc => acc._id.toString() === accountId);
  if (account) {
    Object.assign(account, updateData);
    account.updatedAt = new Date();
  }
  return this.save();
};

// Method to remove trading account
userSchema.methods.removeTradingAccount = function(accountId) {
  this.tradingAccounts = this.tradingAccounts.filter(acc => acc._id.toString() !== accountId);
  
  // If the removed account was primary and there are other accounts, set the first one as primary
  if (this.tradingAccounts.length > 0 && !this.tradingAccounts.some(acc => acc.isPrimary)) {
    this.tradingAccounts[0].isPrimary = true;
  }
  
  return this.save();
};

// Method to set primary broker account
userSchema.methods.setPrimaryBrokerAccount = function(accountId) {
  // First, unset all primary flags
  this.brokerAccounts.forEach(account => {
    account.isPrimary = false;
  });
  
  // Set the specified account as primary
  const account = this.brokerAccounts.find(acc => acc._id.toString() === accountId);
  if (account) {
    account.isPrimary = true;
    return this.save();
  }
  throw new Error('Broker account not found');
};

// Method to get active broker account (for live data)
userSchema.methods.getActiveBrokerAccount = function() {
  const primary = this.getPrimaryBrokerAccount();
  return primary && this.liveDataEnabled ? primary : null;
};

// Static method to create dummy user
userSchema.statics.createDummyUser = async function() {
  return this.create({
    email: 'dummy@example.com',
    phone: '9999999999',
    password: 'dummy123',
    brokerAccounts: []
  });
};

module.exports = mongoose.model('User', userSchema);