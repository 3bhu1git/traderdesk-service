const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const brokerAccountSchema = new Schema({
  brokerName: {
    type: String,
    required: true,
    enum: ['Dhan', 'Zerodha', 'Upstox', 'AngelOne', 'Groww']
  },
  accountId: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  createdAt: {
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to get primary account
userSchema.methods.getPrimaryAccount = function() {
  return this.brokerAccounts.find(account => account.isPrimary);
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

// Method to add new broker account
userSchema.methods.addBrokerAccount = function(accountData) {
  // If this is the first account, set as primary
  if (this.brokerAccounts.length === 0) {
    accountData.isPrimary = true;
  }
  
  this.brokerAccounts.push(accountData);
  return this.save();
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