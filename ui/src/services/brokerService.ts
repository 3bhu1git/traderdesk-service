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
