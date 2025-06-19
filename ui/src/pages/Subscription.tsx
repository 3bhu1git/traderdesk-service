import React from 'react';
import { Check, Crown, Zap, Star, CreditCard, Calendar, RefreshCw } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';

const Subscription: React.FC = () => {
  const { currentPlan, subscribeToPlan } = useSubscription();
  const { user } = useAuth();

  const handleSubscribe = async (planId: string) => {
    const success = await subscribeToPlan(planId);
    if (success) {
      alert('Subscription updated successfully!');
    } else {
      alert('Failed to update subscription. Please try again.');
    }
  };

  const handleRenewSubscription = () => {
    // Implement renewal logic
    alert('Redirecting to payment gateway...');
  };

  const getDaysRemaining = () => {
    if (!user?.subscriptionExpiry) return 0;
    const today = new Date();
    const expiry = new Date(user.subscriptionExpiry);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();
  const isExpiringSoon = daysRemaining <= 7;

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-200 mb-4">Subscription Management</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Manage your subscription and unlock premium trading features
        </p>
      </div>

      {/* Current Subscription Status */}
      {user && (
        <div className={`professional-card p-6 ${isExpiringSoon ? 'bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-700/30' : 'bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-700/30'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${isExpiringSoon ? 'bg-red-900/30' : 'bg-green-900/30'} rounded-xl flex items-center justify-center border ${isExpiringSoon ? 'border-red-700/50' : 'border-green-700/50'}`}>
                <Calendar className={`w-6 h-6 ${isExpiringSoon ? 'text-red-400' : 'text-green-400'}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200">
                  Current Plan: {currentPlan?.name || 'Free Trial'}
                </h3>
                <p className="text-sm text-slate-400">
                  {daysRemaining > 0 ? (
                    <>
                      {daysRemaining} days remaining • 
                      Expires on {user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'N/A'}
                    </>
                  ) : (
                    'Subscription expired'
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isExpiringSoon || daysRemaining === 0 ? (
                <div className="flex items-center space-x-2 px-4 py-2 bg-red-900/30 text-red-400 rounded-sm border border-red-700/50">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {daysRemaining === 0 ? 'Expired' : 'Expiring Soon'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-900/30 text-green-400 rounded-sm border border-green-700/50">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              )}
              <button
                onClick={handleRenewSubscription}
                className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-2 rounded-sm hover:from-green-700 hover:to-green-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-green-500/25"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Renew Subscription</span>
              </button>
            </div>
          </div>

          {/* Subscription Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Subscription Progress</span>
              <span>{daysRemaining} days left</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isExpiringSoon ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.max(0, (daysRemaining / 120) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Current Plan Features */}
      {currentPlan && (
        <div className="professional-card p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-6">
            <Crown className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-semibold text-slate-200">Your {currentPlan.name} Plan Features</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Included Features</h3>
              <div className="space-y-3">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-900/30 rounded-full flex items-center justify-center border border-green-700/50 mt-0.5">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Plan Details</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Plan Name</span>
                  <span className="text-slate-200 font-semibold">{currentPlan.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Price</span>
                  <span className="text-slate-200 font-semibold">₹{currentPlan.price}/{currentPlan.duration.replace('ly', '')}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Renewal Date</span>
                  <span className="text-slate-200 font-semibold">
                    {user?.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Status</span>
                  <span className="text-green-400 font-semibold">Active</span>
                </div>
              </div>
              
              <button
                onClick={handleRenewSubscription}
                className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-sm font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-green-500/25"
              >
                <CreditCard className="w-4 h-4" />
                <span>Manage Subscription</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="professional-card p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-green-400" />
          <span>Accepted Payment Methods</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['UPI', 'Credit Card', 'Debit Card', 'Net Banking'].map((method, index) => (
            <div key={index} className="flex items-center justify-center p-4 bg-slate-800/50 rounded-sm border border-slate-700/50">
              <span className="text-sm font-medium text-slate-300">{method}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="professional-card p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-200 mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-slate-200 mb-2">Can I cancel my subscription anytime?</h4>
            <p className="text-sm text-slate-400">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-200 mb-2">What happens if I upgrade mid-cycle?</h4>
            <p className="text-sm text-slate-400">You'll be charged the prorated amount and get immediate access to all premium features.</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-200 mb-2">Do you offer refunds?</h4>
            <p className="text-sm text-slate-400">Yes, we offer a 7-day money-back guarantee for all new subscriptions.</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-200 mb-2">Is there a free trial?</h4>
            <p className="text-sm text-slate-400">Yes, all new users get a 3-day free trial with full access to premium features.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;