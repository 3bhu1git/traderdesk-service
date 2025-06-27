import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import AuthService from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (phone: string, otp: string) => Promise<boolean>;
  loginWithGoogle: (userData: Partial<User>) => Promise<boolean>;
  logout: () => void;
  sendOTP: (phone: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const generateDeviceId = () => {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('traderdesk_user');
    const storedToken = localStorage.getItem('traderdesk_auth_token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        
        // Validate that the user ID exists
        if (!userData.id) {
          console.warn('Invalid user data detected, clearing stored user data');
          localStorage.removeItem('traderdesk_user');
          localStorage.removeItem('traderdesk_auth_token');
          setIsLoading(false);
          return;
        }
        
        const subscriptionExpiry = new Date(userData.subscriptionExpiry);
        
        // Check if session is still valid (12 hours)
        const sessionExpiry = userData.sessionExpiry ? new Date(userData.sessionExpiry) : new Date();
        const now = new Date();
        
        if (sessionExpiry > now && subscriptionExpiry > now) {
          setUser({
            ...userData,
            subscriptionExpiry,
            registrationDate: new Date(userData.registrationDate),
            sessionExpiry
          });
        } else {
          // Session or subscription expired
          localStorage.removeItem('traderdesk_user');
          localStorage.removeItem('traderdesk_auth_token');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('traderdesk_user');
        localStorage.removeItem('traderdesk_auth_token');
      }
    }
    setIsLoading(false);

    // Add beforeunload event listener to prevent accidental navigation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only prevent if user is logged in
      if (user) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const sendOTP = async (phone: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Validate phone number format
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        console.error('Invalid phone number format:', phone);
        throw new Error('Invalid phone number format');
      }

      console.log(`[AuthContext] Sending OTP to +91${phone}`);
      
      // Use AuthService to send OTP
      const result = await AuthService.sendOTP(phone);

      if (!result.success) {
        console.error('[AuthContext] Send OTP failed:', result.message);
        throw new Error(result.message || 'Failed to send OTP');
      }

      // Store phone for OTP verification
      localStorage.setItem('traderdesk_otp_phone', phone);
      
      console.log('[AuthContext] OTP sent successfully:', result);
      if (result.demoOTP) {
        console.log(`[AuthContext] Demo OTP: ${result.demoOTP}`);
      }
      
      return true;
    } catch (error) {
      console.error('[AuthContext] Failed to send OTP:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Validate OTP format
      if (!/^\d{6}$/.test(otp)) {
        console.error('[AuthContext] Invalid OTP format:', otp);
        throw new Error('Invalid OTP format');
      }

      // Verify phone matches the one OTP was sent to
      const storedPhone = localStorage.getItem('traderdesk_otp_phone');
      if (!storedPhone || storedPhone !== phone) {
        console.error('[AuthContext] Phone number mismatch. Stored:', storedPhone, 'Provided:', phone);
        throw new Error('Phone number mismatch');
      }

      console.log(`[AuthContext] Verifying OTP for +91${phone}`);

      // Use AuthService to verify OTP and login/register
      const result = await AuthService.verifyOTP(phone, otp, `User ${phone.slice(-4)}`);

      console.log('[AuthContext] Verify OTP response:', result);

      if (!result.success || !result.data) {
        console.error('[AuthContext] Verify OTP failed:', result.message);
        throw new Error(result.message || 'Failed to verify OTP');
      }

      // Extract user data from backend response
      const backendUser = result.data.user;

      // Create session expiry (12 hours from now)
      const sessionExpiry = new Date();
      sessionExpiry.setHours(sessionExpiry.getHours() + 12);

      // Create subscription expiry (4 months from now for phone login)
      const subscriptionExpiry = new Date();
      subscriptionExpiry.setMonth(subscriptionExpiry.getMonth() + 4);

      // Map backend user data to frontend User type
      const userData: User = {
        id: backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        phone: backendUser.phone,
        isActive: backendUser.isActive,
        subscriptionExpiry,
        registrationDate: new Date(backendUser.registrationDate),
        loginMethod: 'phone',
        isPaidUser: true,
        deviceId: generateDeviceId(),
        sessionId: generateSessionId(),
        sessionExpiry
      };

      setUser(userData);
      
      // Store user data (token is already stored by AuthService)
      localStorage.setItem('traderdesk_user', JSON.stringify(userData));
      
      // Clear OTP phone
      localStorage.removeItem('traderdesk_otp_phone');
      
      console.log('[AuthContext] Login successful:', result);
      console.log('[AuthContext] User data stored:', userData);
      
      return true;
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (!userData.email || !userData.name) {
        throw new Error('Missing required Google account information');
      }

      // Require phone number for Google login
      if (!userData.phone) {
        return false;
      }

      // Create session expiry (12 hours from now)
      const sessionExpiry = new Date();
      sessionExpiry.setHours(sessionExpiry.getHours() + 12);

      // Create subscription expiry (3 days trial for Google login)
      const subscriptionExpiry = new Date();
      subscriptionExpiry.setDate(subscriptionExpiry.getDate() + 3);

      const userId = `user_${Date.now()}_${userData.email?.split('@')[0]}`;
      
      const newUser: User = {
        id: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        isActive: true,
        subscriptionExpiry,
        registrationDate: new Date(),
        loginMethod: 'google',
        isPaidUser: false, // Free trial for Google users
        deviceId: generateDeviceId(),
        sessionId: generateSessionId(),
        sessionExpiry
      };

      setUser(newUser);
      localStorage.setItem('traderdesk_user', JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      console.error('Google login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('traderdesk_user');
    localStorage.removeItem('traderdesk_auth_token');
    localStorage.removeItem('traderdesk_otp_phone');
    
    // Clear any Google Sign-In session
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const value: AuthContextType = {
    user,
    login,
    loginWithGoogle,
    logout,
    sendOTP,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};