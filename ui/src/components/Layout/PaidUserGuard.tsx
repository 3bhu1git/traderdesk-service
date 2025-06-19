import React from 'react';
import { Lock, Crown, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaidUserGuardProps {
  children: React.ReactNode;
  isPaidUser: boolean;
  featureName: string;
}

const PaidUserGuard: React.FC<PaidUserGuardProps> = ({ children, isPaidUser, featureName }) => {
  if (isPaidUser) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="glass-card p-12 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Feature</h2>
        <p className="text-gray-600 mb-6">
          {featureName} is available only for premium subscribers. Upgrade your plan to access this feature.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-purple-600 mb-4">
            <Crown className="w-5 h-5" />
            <span className="font-semibold">Premium Benefits</span>
          </div>
          
          <ul className="text-sm text-gray-600 space-y-2 mb-6">
            <li>• Advanced Stock Screeners</li>
            <li>• Premium Indicators</li>
            <li>• Real-time Trading Desk</li>
            <li>• Video Tutorials</li>
            <li>• WhatsApp Support</li>
          </ul>
          
          <Link
            to="/subscription"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
          >
            <CreditCard className="w-5 h-5" />
            <span>Upgrade to Premium</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaidUserGuard;