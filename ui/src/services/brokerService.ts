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
  balance?: number;
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

export interface DataBrokerConnection {
  id: string;
  brokerName: string;
  connectionName: string;
  accountId: string;
  clientId: string;
  isPrimary: boolean;
  isActive: boolean;
  lastConnected?: string;
  createdAt: string;
}

export interface DataBrokerCredentials {
  brokerName: string;
  connectionName: string;
  clientId: string;
  accessToken: string;
}

export interface LiveDataStatus {
  enabled: boolean;
  primaryBroker?: DataBrokerConnection;
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
   * Toggle live trading status for a specific account
   */
  public static async toggleAccountLiveStatus(accountId: string, isLive: boolean): Promise<BrokerResponse> {
    try {
      console.log(`[BrokerService] Toggling live status for account ${accountId} to ${isLive}`);

      const response = await fetch(`${API_BASE_URL}/api/brokers/trading-accounts/${accountId}/live-status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isLive })
      });

      const result = await response.json();
      console.log('[BrokerService] Toggle live status response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Error toggling live status:', error);
      return {
        success: false,
        message: 'Failed to toggle live status. Please try again.'
      };
    }
  }

  /**
   * Bulk toggle live trading status for all accounts
   */
  public static async bulkToggleLiveStatus(isLive: boolean): Promise<BrokerResponse> {
    try {
      console.log(`[BrokerService] Bulk toggling live status to ${isLive}`);

      const response = await fetch(`${API_BASE_URL}/api/brokers/trading-accounts/bulk/live-status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isLive })
      });

      const result = await response.json();
      console.log('[BrokerService] Bulk toggle live status response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Error bulk toggling live status:', error);
      return {
        success: false,
        message: 'Failed to update accounts. Please try again.'
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

  /**
   * Get live trading accounts count
   */
  public static async getLiveAccountsCount(): Promise<{ count: number; total: number }> {
    try {
      const result = await this.getTradingAccounts();
      if (result.success && result.data?.accounts) {
        const accounts = result.data.accounts as TradingAccount[];
        const liveCount = accounts.filter(account => account.isLive).length;
        return { count: liveCount, total: accounts.length };
      }
      return { count: 0, total: 0 };
    } catch (error) {
      console.error('[BrokerService] Get live accounts count error:', error);
      return { count: 0, total: 0 };
    }
  }

  // ===============================
  // Data Broker Connection Methods
  // ===============================

  /**
   * Add a new data broker connection
   */
  public static async addDataBrokerConnection(credentials: DataBrokerCredentials): Promise<BrokerResponse> {
    try {
      console.log('[BrokerService] Adding data broker connection:', credentials.brokerName);

      const response = await fetch(`${API_BASE_URL}/api/brokers/data-connections`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(credentials)
      });

      const result = await response.json();
      console.log('[BrokerService] Add data broker connection response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Add data broker connection error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Get all data broker connections
   */
  public static async getDataBrokerConnections(): Promise<BrokerResponse> {
    try {
      console.log('[BrokerService] Getting data broker connections');

      const response = await fetch(`${API_BASE_URL}/api/brokers/data-connections`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      console.log('[BrokerService] Get data broker connections response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Get data broker connections error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Set primary data broker connection
   */
  public static async setPrimaryDataBroker(connectionId: string): Promise<BrokerResponse> {
    try {
      console.log('[BrokerService] Setting primary data broker:', connectionId);

      const response = await fetch(`${API_BASE_URL}/api/brokers/data-connections/primary`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ connectionId })
      });

      const result = await response.json();
      console.log('[BrokerService] Set primary data broker response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Set primary data broker error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Delete a data broker connection
   */
  public static async deleteDataBrokerConnection(connectionId: string): Promise<BrokerResponse> {
    try {
      console.log('[BrokerService] Deleting data broker connection:', connectionId);

      const response = await fetch(`${API_BASE_URL}/api/brokers/data-connections/${connectionId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      console.log('[BrokerService] Delete data broker connection response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Delete data broker connection error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Connect a specific data broker connection
   */
  public static async connectDataBrokerConnection(connectionId: string): Promise<BrokerResponse> {
    try {
      console.log(`[BrokerService] Connecting data broker connection: ${connectionId}`);

      const response = await fetch(`${API_BASE_URL}/api/brokers/data-connections/${connectionId}/connect`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      console.log('[BrokerService] Connect data broker connection response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Connect data broker connection error:', error);
      return {
        success: false,
        message: 'Failed to connect data broker connection. Please try again.'
      };
    }
  }

  /**
   * Disconnect a specific data broker connection
   */
  public static async disconnectDataBrokerConnection(connectionId: string): Promise<BrokerResponse> {
    try {
      console.log(`[BrokerService] Disconnecting data broker connection: ${connectionId}`);

      const response = await fetch(`${API_BASE_URL}/api/brokers/data-connections/${connectionId}/disconnect`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      console.log('[BrokerService] Disconnect data broker connection response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Disconnect data broker connection error:', error);
      return {
        success: false,
        message: 'Failed to disconnect data broker connection. Please try again.'
      };
    }
  }

  /**
   * Toggle live data integration using primary connection
   */
  public static async toggleLiveDataIntegration(enabled: boolean): Promise<BrokerResponse> {
    try {
      console.log(`[BrokerService] Toggling live data integration to ${enabled}`);

      const response = await fetch(`${API_BASE_URL}/api/brokers/live-data/toggle`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ enabled })
      });

      const result = await response.json();
      console.log('[BrokerService] Toggle live data integration response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Toggle live data integration error:', error);
      return {
        success: false,
        message: 'Failed to toggle live data integration. Please try again.'
      };
    }
  }

  /**
   * Get live data status and primary broker info
   */
  public static async getLiveDataStatus(): Promise<{ success: boolean; data?: LiveDataStatus; message?: string }> {
    try {
      console.log('[BrokerService] Getting live data status');

      const response = await fetch(`${API_BASE_URL}/api/brokers/live-data/status`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      console.log('[BrokerService] Get live data status response:', result);

      return result;
    } catch (error) {
      console.error('[BrokerService] Get live data status error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }
}

export default BrokerService;
