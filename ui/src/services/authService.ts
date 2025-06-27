import { getApiBaseUrl } from '../lib/getApiBaseUrl';

const API_BASE_URL = getApiBaseUrl();
console.log('[AuthService] Using API Base URL:', API_BASE_URL);

export interface AuthResponse {
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
      brokerAccounts: any[];
    };
    token: string;
    expiresIn: string;
  };
  demoOTP?: string;
  errors?: any[];
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  demoOTP?: string;
}

class AuthService {
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

  public static async sendOTP(phone: string): Promise<SendOTPResponse> {
    try {
      console.log('[AuthService] Sending OTP request to:', `${API_BASE_URL}/api/auth/send-otp`);
      console.log('[AuthService] Phone number:', phone);

      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ phone })
      });

      console.log('[AuthService] Response status:', response.status);
      console.log('[AuthService] Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log('[AuthService] Response body:', result);

      if (!response.ok) {
        console.error('[AuthService] HTTP error:', response.status, result.message);
        throw new Error(result.message || 'Failed to send OTP');
      }

      return result;
    } catch (error) {
      console.error('[AuthService] sendOTP error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send OTP'
      };
    }
  }

  public static async verifyOTP(phone: string, otp: string, name?: string): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Verifying OTP request to:', `${API_BASE_URL}/api/auth/verify-otp`);
      console.log('[AuthService] Request data:', { phone, otp, name });

      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ phone, otp, name })
      });

      console.log('[AuthService] Verify response status:', response.status);

      const result = await response.json();
      console.log('[AuthService] Verify response body:', result);

      if (!response.ok) {
        console.error('[AuthService] Verify HTTP error:', response.status, result.message);
        throw new Error(result.message || 'Failed to verify OTP');
      }

      // Store auth token if login successful
      if (result.success && result.data?.token) {
        console.log('[AuthService] Storing auth token');
        localStorage.setItem('traderdesk_auth_token', result.data.token);
      }

      return result;
    } catch (error) {
      console.error('[AuthService] verifyOTP error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify OTP'
      };
    }
  }

  public static async getProfile(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get profile');
      }

      return result;
    } catch (error) {
      console.error('AuthService.getProfile error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get profile'
      };
    }
  }

  public static async updateProfile(name?: string, email?: string): Promise<AuthResponse> {
    try {
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      return result;
    } catch (error) {
      console.error('AuthService.updateProfile error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update profile'
      };
    }
  }

  public static async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to refresh token');
      }

      // Store new auth token
      if (result.success && result.data?.token) {
        localStorage.setItem('traderdesk_auth_token', result.data.token);
      }

      return result;
    } catch (error) {
      console.error('AuthService.refreshToken error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to refresh token'
      };
    }
  }

  public static clearAuth(): void {
    localStorage.removeItem('traderdesk_auth_token');
    localStorage.removeItem('traderdesk_user');
    localStorage.removeItem('traderdesk_otp_phone');
  }

  public static isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export default AuthService;
