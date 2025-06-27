import { getApiBaseUrl } from '../lib/getApiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

export interface DhanCredentials {
  clientId: string;
  accessToken: string;
  customer?: string;
}

export interface BrokerConnection {
  id: string;
  brokerName: string;
  accountId: string;
  isPrimary: boolean;
  status: string;
  connectedAt: string;
  customer?: string;
}

export interface BrokerResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface TradingAccount {
  id: string;
  brokerName: string;
  accountName: string;
  accountId: string;
  accountType: 'Trading' | 'Demat' | 'Combined';
  isActive: boolean;
  isPrimary: boolean;
  isLive: boolean;
  accessToken: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TradingAccountData {
  brokerName: string;
  accountName: string;
  accountId: string;
  accountType?: 'Trading' | 'Demat' | 'Combined';
  apiKey?: string;
  accessToken: string;
  tags?: string[];
  isLive?: boolean;
}

class BrokerService {
  private static getAuthToken(): string | null {
    return localStorage.getItem('traderdesk_auth_token');
  }

  private static getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Connect to Dhan broker
   */
  public static async connectDhan(credentials: DhanCredentials): Promise<BrokerResponse> {
    try {
      console.log('[BrokerService] Connecting to Dhan broker:', { clientId: credentials.clientId });

      const response = await fetch(`${API_BASE_URL}/api/brokers/dhan/connect`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          clientId: credentials.clientId,
          accessToken: credentials.accessToken,
          customer: credentials.customer
        })
      });

      const result = await response.json();
      console.log('[BrokerService] Dhan connection response:', result);

      // Save credentials to localStorage if successful
      if (result.success) {
        localStorage.setItem('dhanCredentials', JSON.stringify({
          clientId: credentials.clientId,
          accessToken: credentials.accessToken,
          customer: credentials.customer,
          connectedAt: new Date().toISOString()
        }));
      }

      return result;
    } catch (error) {
      console.error('[BrokerService] Dhan connection error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Disconnect from Dhan broker
   */
  public static async disconnectDhan(): Promise<BrokerResponse> {
    try {
      console.log('[BrokerService] Disconnecting from Dhan broker');
      
      const token = this.getAuthToken();
      console.log('[BrokerService] Auth token available:', !!token);
      
      const headers = this.getAuthHeaders();
      console.log('[BrokerService] Request headers:', headers);

      const response = await fetch(`${API_BASE_URL}/api/brokers/dhan/disconnect`, {
        method: 'POST',
        headers: headers
      });

      console.log('[BrokerService] Response status:', response.status);
      console.log('[BrokerService] Response ok:', response.ok);

      const result = await response.json();
      console.log('[BrokerService] Dhan disconnection response:', result);

      // Remove credentials from localStorage if successful
      if (result.success) {
        localStorage.removeItem('dhanCredentials');
        console.log('[BrokerService] Removed dhanCredentials from localStorage');
      }

      return result;
    } catch (error) {
      console.error('[BrokerService] Dhan disconnection error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Get all broker connections
   */
  public static async getBrokerConnections(): Promise<BrokerResponse> {
    try {
      console.log('[BrokerService] Fetching broker connections');

      const response = await fetch(`${API_BASE_URL}/api/brokers/connections`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      console.log('[BrokerService] Broker connections response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Get broker connections error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Set primary broker account
   */
  public static async setPrimaryBroker(accountId: string): Promise<BrokerResponse> {
    try {
      console.log('[BrokerService] Setting primary broker:', accountId);

      const response = await fetch(`${API_BASE_URL}/api/brokers/primary`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ accountId })
      });

      const result = await response.json();
      console.log('[BrokerService] Set primary broker response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Set primary broker error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Add a new trading account
   */
  public static async addTradingAccount(accountData: TradingAccountData): Promise<BrokerResponse> {
    try {
      console.log('[BrokerService] Adding trading account:', accountData);

      const response = await fetch(`${API_BASE_URL}/api/brokers/trading-accounts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(accountData)
      });

      const result = await response.json();
      console.log('[BrokerService] Add trading account response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Add trading account error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Get all trading accounts
   */
  public static async getTradingAccounts(): Promise<BrokerResponse> {
    try {
      console.log('[BrokerService] Fetching trading accounts');

      const response = await fetch(`${API_BASE_URL}/api/brokers/trading-accounts`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      console.log('[BrokerService] Trading accounts response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Get trading accounts error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Update a trading account
   */
  public static async updateTradingAccount(accountId: string, updateData: Partial<TradingAccountData>): Promise<BrokerResponse> {
    try {
      console.log('[BrokerService] Updating trading account:', accountId, updateData);

      const response = await fetch(`${API_BASE_URL}/api/brokers/trading-accounts/${accountId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      console.log('[BrokerService] Update trading account response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Update trading account error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Delete a trading account
   */
  public static async deleteTradingAccount(accountId: string): Promise<BrokerResponse> {
    try {
      console.log('[BrokerService] Deleting trading account:', accountId);

      const response = await fetch(`${API_BASE_URL}/api/brokers/trading-accounts/${accountId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      console.log('[BrokerService] Delete trading account response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Delete trading account error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Set primary trading account
   */
  public static async setPrimaryTradingAccount(accountId: string): Promise<BrokerResponse> {
    try {
      console.log('[BrokerService] Setting primary trading account:', accountId);

      const response = await fetch(`${API_BASE_URL}/api/brokers/trading-accounts/primary`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ accountId })
      });

      const result = await response.json();
      console.log('[BrokerService] Set primary trading account response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Set primary trading account error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Check if Dhan is connected (from localStorage)
   */
  public static isDhanConnected(): boolean {
    const credentials = localStorage.getItem('dhanCredentials');
    return !!credentials;
  }

  /**
   * Get Dhan credentials from localStorage
   */
  public static getDhanCredentials(): DhanCredentials | null {
    try {
      const credentials = localStorage.getItem('dhanCredentials');
      return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
      console.error('[BrokerService] Error parsing Dhan credentials:', error);
      return null;
    }
  }
}

export default BrokerService;
