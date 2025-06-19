import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Admin, MenuContent, Announcement } from '../types';

interface AdminContextType {
  admin: Admin | null;
  users: User[];
  menuContent: MenuContent[];
  announcements: Announcement[];
  loginAdmin: (username: string, password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  extendSubscription: (userId: string, days: number) => void;
  updateMenuContent: (contentId: string, updates: Partial<MenuContent>) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
  isAdminAuthenticated: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+919876543210',
      isActive: true,
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      registrationDate: new Date('2024-01-15'),
      loginMethod: 'phone',
      isPaidUser: true
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+919876543211',
      isActive: false,
      subscriptionExpiry: new Date('2024-01-01'),
      registrationDate: new Date('2023-12-01'),
      loginMethod: 'google',
      isPaidUser: false
    },
    {
      id: '3',
      name: 'Raj Patel',
      email: 'raj@example.com',
      phone: '+919876543212',
      isActive: true,
      subscriptionExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      registrationDate: new Date('2024-01-10'),
      loginMethod: 'phone',
      isPaidUser: true
    },
    {
      id: '4',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+919876543213',
      isActive: true,
      subscriptionExpiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      registrationDate: new Date('2024-01-20'),
      loginMethod: 'phone',
      isPaidUser: true
    }
  ]);

  const [menuContent, setMenuContent] = useState<MenuContent[]>([
    {
      id: 'trading-desk',
      title: 'Trading Desk',
      description: 'Live charts with IV, OI analysis',
      features: ['Real-time Charts', 'Option Chain Analysis', 'VIX Analysis'],
      isActive: true
    },
    {
      id: 'screener',
      title: 'Screener Tools',
      description: 'Long-term, IPO, F&O screeners',
      features: ['Stock Screening', 'IPO Analysis', 'F&O Tools'],
      isActive: true
    },
    {
      id: 'indicators',
      title: 'Premium Indicators',
      description: 'Magic levels, MTF analysis',
      features: ['Technical Indicators', 'Magic Levels', 'Multi-timeframe Analysis'],
      isActive: true
    }
  ]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      userId: '1',
      userName: 'John D.',
      stockSymbol: 'RELIANCE',
      profit: 15000,
      percentage: 12.5,
      date: new Date(),
      tradeType: 'buy'
    },
    {
      id: '2',
      userId: '2',
      userName: 'Sarah M.',
      stockSymbol: 'TCS',
      profit: 8500,
      percentage: 8.2,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      tradeType: 'sell'
    },
    {
      id: '3',
      userId: '3',
      userName: 'Raj P.',
      stockSymbol: 'HDFCBANK',
      profit: 12300,
      percentage: 9.8,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tradeType: 'buy'
    }
  ]);

  const loginAdmin = async (username: string, password: string): Promise<boolean> => {
    if (username === 'admin' && password === 'general@123') {
      const adminUser = {
        id: 'admin1',
        username: 'admin',
        email: 'admin@traderdesk.ai'
      };
      setAdmin(adminUser);
      
      // Store admin session in localStorage
      localStorage.setItem('traderdesk_admin', JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem('traderdesk_admin');
    
    // Force redirect to admin login page
    window.location.href = '/admin';
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  };

  const extendSubscription = (userId: string, days: number) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const newExpiry = new Date(user.subscriptionExpiry);
        newExpiry.setDate(newExpiry.getDate() + days);
        return { 
          ...user, 
          subscriptionExpiry: newExpiry,
          isActive: true,
          isPaidUser: true
        };
      }
      return user;
    }));
  };

  const updateMenuContent = (contentId: string, updates: Partial<MenuContent>) => {
    setMenuContent(prev => prev.map(content =>
      content.id === contentId ? { ...content, ...updates } : content
    ));
  };

  const addAnnouncement = (announcement: Omit<Announcement, 'id'>) => {
    const newAnnouncement = {
      ...announcement,
      id: Date.now().toString()
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };

  // Check for existing admin session on mount
  React.useEffect(() => {
    const storedAdmin = localStorage.getItem('traderdesk_admin');
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        setAdmin(adminData);
      } catch (error) {
        console.error('Error parsing stored admin data:', error);
        localStorage.removeItem('traderdesk_admin');
      }
    }
  }, []);

  const value: AdminContextType = {
    admin,
    users,
    menuContent,
    announcements,
    loginAdmin,
    logoutAdmin,
    updateUser,
    extendSubscription,
    updateMenuContent,
    addAnnouncement,
    isAdminAuthenticated: !!admin
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};