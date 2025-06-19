// Broker Adapter Interface
// This defines the common interface that all broker adapters must implement

export interface BrokerAdapter {
  // Authentication
  authenticate(): Promise<boolean>;
  
  // User Profile
  getUserProfile(): Promise<any>;
  
  // Portfolio
  getHoldings(): Promise<any[]>;
  getPositions(): Promise<any[]>;
  
  // Orders
  getOrders(): Promise<any[]>;
  
  // Funds
  getFunds(): Promise<any>;
}

// Factory to create broker adapters
export class BrokerAdapterFactory {
  static createAdapter(brokerName: string): BrokerAdapter | null {
    // Dynamic import of broker adapters
    switch (brokerName.toLowerCase()) {
      case 'dhan':
        // Import and return DhanApiService
        const { DhanApiService } = require('./dhanApiService');
        return DhanApiService;
      case 'zerodha':
        // Import and return ZerodhaApiService when implemented
        // const { ZerodhaApiService } = require('./zerodhaApiService');
        // return ZerodhaApiService;
        console.warn('Zerodha adapter not fully implemented yet');
        return null;
      default:
        console.error(`No adapter available for broker: ${brokerName}`);
        return null;
    }
  }
}