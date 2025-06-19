const mongoose = require('mongoose');
const User = require('../models/User');

class BrokerPanel {
  constructor(userId) {
    this.userId = userId;
  }

  async getUser() {
    return await User.findById(this.userId);
  }

  async getBrokerAccounts() {
    const user = await this.getUser();
    return user ? user.brokerAccounts : [];
  }

  async getPrimaryAccount() {
    const user = await this.getUser();
    return user ? user.getPrimaryAccount() : null;
  }

  async addBrokerAccount(accountData) {
    const user = await this.getUser();
    if (!user) throw new Error('User not found');
    
    return await user.addBrokerAccount(accountData);
  }

  async addDhanConnection(dhanCredentials) {
    const user = await this.getUser();
    if (!user) throw new Error('User not found');
    
    const accountData = {
      brokerName: 'Dhan',
      accountId: dhanCredentials.clientId,
      apiKey: dhanCredentials.apiKey,
      accessToken: dhanCredentials.accessToken
    };
    
    return await user.addBrokerAccount(accountData);
  }

  async setPrimaryAccount(accountId) {
    const user = await this.getUser();
    if (!user) throw new Error('User not found');
    
    return await user.setPrimaryAccount(accountId);
  }

  async render() {
    const accounts = await this.getBrokerAccounts();
    const primaryAccount = await this.getPrimaryAccount();
    
    return {
      accounts,
      primaryAccountId: primaryAccount ? primaryAccount.accountId : null
    };
  }
}

module.exports = BrokerPanel;