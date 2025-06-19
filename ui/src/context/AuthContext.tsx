import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

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

// Google OAuth configuration
const GOOGLE_CLIENT_ID = 'your-google-client-id'; // Replace with actual client ID

// Helper function to generate UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper function to validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

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
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        
        // Validate that the user ID is a proper UUID or starts with 'user_'
        if (!userData.id || (!isValidUUID(userData.id) && !userData.id.startsWith('user_'))) {
          console.warn('Invalid user ID format detected, clearing stored user data');
          localStorage.removeItem('traderdesk_user');
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
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('traderdesk_user');
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
        throw new Error('Invalid phone number format');
      }

      // Simulate OTP sending API call
      console.log(`Sending OTP to +91${phone}`);
      
      // In a real implementation, you would call your backend API here
      // const response = await fetch('/api/send-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phone: `+91${phone}` })
      // });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store phone in localStorage for OTP verification
      localStorage.setItem('traderdesk_otp_phone', phone);
      
      return true;
    } catch (error) {
      console.error('Failed to send OTP:', error);
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
        throw new Error('Invalid OTP format');
      }

      // Verify phone matches the one OTP was sent to
      const storedPhone = localStorage.getItem('traderdesk_otp_phone');
      if (!storedPhone || storedPhone !== phone) {
        throw new Error('Phone number mismatch');
      }

      // Simulate OTP verification
      // In demo mode, accept 123456 or any 6-digit OTP
      const isValidOTP = otp === '123456' || /^\d{6}$/.test(otp);
      
      if (!isValidOTP) {
        throw new Error('Invalid OTP');
      }

      // Create session expiry (12 hours from now)
      const sessionExpiry = new Date();
      sessionExpiry.setHours(sessionExpiry.getHours() + 12);

      // Create subscription expiry (4 months from now for phone login)
      const subscriptionExpiry = new Date();
      subscriptionExpiry.setMonth(subscriptionExpiry.getMonth() + 4);

      const userId = `user_${Date.now()}_${phone.slice(-4)}`;
      
      const userData: User = {
        id: userId,
        name: `User ${phone.slice(-4)}`,
        email: `user${phone.slice(-4)}@traderdesk.ai`,
        phone: `+91${phone}`,
        isActive: true,
        subscriptionExpiry,
        registrationDate: new Date(),
        loginMethod: 'phone',
        isPaidUser: true,
        deviceId: generateDeviceId(),
        sessionId: generateSessionId(),
        sessionExpiry
      };

      setUser(userData);
      localStorage.setItem('traderdesk_user', JSON.stringify(userData));
      
      // Clear OTP phone
      localStorage.removeItem('traderdesk_otp_phone');
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
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