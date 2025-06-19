import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'quarterly' | 'annual';
  features: string[];
  isActive: boolean;
}

interface SubscriptionContextType {
  currentPlan: SubscriptionPlan | null;
  availablePlans: SubscriptionPlan[];
  hasAccess: (feature: string) => boolean;
  subscribeToPlan: (planId: string) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>({
    id: 'premium',
    name: 'Premium',
    price: 2999,
    duration: 'monthly',
    features: ['All Screeners', 'Daily Signals', 'Advanced Indicators', 'Video Tutorials'],
    isActive: true
  });

  const availablePlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 999,
      duration: 'monthly',
      features: ['Basic Screeners', 'Weekly Signals'],
      isActive: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 2999,
      duration: 'monthly',
      features: ['All Screeners', 'Daily Signals', 'Advanced Indicators', 'Video Tutorials'],
      isActive: false
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 4999,
      duration: 'monthly',
      features: ['Everything in Premium', 'Real-time Alerts', 'Custom Indicators', 'WhatsApp Support'],
      isActive: false
    }
  ];

  const hasAccess = (feature: string): boolean => {
    if (!currentPlan || !currentPlan.isActive) return false;
    return currentPlan.features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
  };

  const subscribeToPlan = async (planId: string): Promise<boolean> => {
    try {
      const plan = availablePlans.find(p => p.id === planId);
      if (plan) {
        setCurrentPlan({ ...plan, isActive: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Subscription failed:', error);
      return false;
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    try {
      if (currentPlan) {
        setCurrentPlan({ ...currentPlan, isActive: false });
      }
      return true;
    } catch (error) {
      console.error('Cancellation failed:', error);
      return false;
    }
  };

  const value: SubscriptionContextType = {
    currentPlan,
    availablePlans,
    hasAccess,
    subscribeToPlan,
    cancelSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};