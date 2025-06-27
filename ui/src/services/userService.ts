import { getApiBaseUrl } from '../lib/getApiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

export interface UserProfile {
  name: string;
  email: string;
  tradingExperience: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  tradingStyle: 'Day Trading' | 'Swing Trading' | 'Position Trading' | 'Scalping';
}

export interface UserResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      phone: string;
      email: string;
      name: string;
      isActive: boolean;
      loginMethod: string;
      registrationDate: string;
      lastLogin?: string;
      isProfileComplete: boolean;
      tradingExperience?: string;
      tradingStyle?: string;
      brokerAccounts: any[];
    };
  };
}

class UserService {
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

  public static async updateProfile(profileData: Partial<UserProfile>): Promise<UserResponse> {
    try {
      console.log('[UserService] Updating profile:', profileData);

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      const result = await response.json();
      console.log('[UserService] Update profile response:', result);

      if (!response.ok) {
        console.error('[UserService] Update profile HTTP error:', response.status, result.message);
        throw new Error(result.message || 'Failed to update profile');
      }

      return result;
    } catch (error) {
      console.error('[UserService] Update profile error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update profile'
      };
    }
  }

  public static async getProfile(): Promise<UserResponse> {
    try {
      console.log('[UserService] Getting profile');

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      console.log('[UserService] Get profile response:', result);

      if (!response.ok) {
        console.error('[UserService] Get profile HTTP error:', response.status, result.message);
        throw new Error(result.message || 'Failed to get profile');
      }

      return result;
    } catch (error) {
      console.error('[UserService] Get profile error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get profile'
      };
    }
  }
}

export default UserService;
