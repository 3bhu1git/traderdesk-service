import React, { useState } from 'react';
import { User, Phone, Shield, Clock, Smartphone, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentPlan } = useSubscription();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Trading Professional',
    email: 'trader@example.com',
    experience: 'Intermediate',
    tradingStyle: 'Swing Trading'
  });

  const handleSave = () => {
    // In real app, save to backend
    setIsEditing(false);
  };

  const sessionInfo = {
    deviceId: user?.deviceId?.slice(-8) || 'Unknown',
    sessionId: user?.sessionId?.slice(-8) || 'Unknown',
    loginTime: new Date().toLocaleString(),
    expiryTime: user?.sessionExpiry ? new Date(user.sessionExpiry).toLocaleString() : 'Unknown',
    remainingTime: user?.sessionExpiry ? 
      Math.max(0, Math.floor((new Date(user.sessionExpiry).getTime() - new Date().getTime()) / 1000 / 60 / 60)) 
      : 0
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Profile Settings</h1>
          <p className="text-slate-400 mt-1">Manage your account and preferences</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-sm hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="professional-card p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-6">
            <User className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-semibold text-slate-200">Profile Information</h2>
          </div>

          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user?.phone?.slice(-2) || 'TD'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200">{formData.name}</h3>
                <p className="text-sm text-slate-400">{user?.phone}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 disabled:bg-slate-800/30 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 disabled:bg-slate-800/30 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Trading Experience</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 disabled:bg-slate-800/30 disabled:cursor-not-allowed"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Trading Style</label>
                <select
                  value={formData.tradingStyle}
                  onChange={(e) => setFormData({...formData, tradingStyle: e.target.value})}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 disabled:bg-slate-800/30 disabled:cursor-not-allowed"
                >
                  <option>Day Trading</option>
                  <option>Swing Trading</option>
                  <option>Position Trading</option>
                  <option>Scalping</option>
                </select>
              </div>
            </div>

            {isEditing && (
              <button
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-sm font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-green-500/25"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            )}
          </div>
        </div>

        {/* Session Information */}
        <div className="space-y-6">
          {/* Current Session */}
          <div className="professional-card p-6 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold text-slate-200">Session Security</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="font-medium text-slate-200">Current Device</div>
                    <div className="text-sm text-slate-400">ID: ...{sessionInfo.deviceId}</div>
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="font-medium text-slate-200">Session Time</div>
                    <div className="text-sm text-slate-400">{sessionInfo.remainingTime}h remaining</div>
                  </div>
                </div>
                <div className="text-sm text-orange-400 font-medium">
                  {sessionInfo.remainingTime < 2 ? 'Expiring Soon' : 'Active'}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-sm p-4">
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-slate-200 mb-1">Security Notice</div>
                    <ul className="text-slate-400 space-y-1">
                      <li>• Single device access for security</li>
                      <li>• Session expires after 12 hours</li>
                      <li>• Automatic logout on new device login</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="professional-card p-6 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-6">
              <Phone className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold text-slate-200">Subscription Status</h2>
            </div>

            <div className="space-y-4">
              {currentPlan && (
                <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-700/30 rounded-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-green-300">{currentPlan.name} Plan</h3>
                    <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-sm text-sm font-medium border border-green-700/50">
                      Active
                    </span>
                  </div>
                  <div className="text-sm text-green-300 space-y-1">
                    <div>Price: ₹{currentPlan.price}/{currentPlan.duration.replace('ly', '')}</div>
                    <div>Next billing: 30 days</div>
                    <div>Features: {currentPlan.features.length} included</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-400">Login Method</div>
                  <div className="font-medium text-slate-200">Phone OTP</div>
                </div>
                <div>
                  <div className="text-slate-400">Account Type</div>
                  <div className="font-medium text-slate-200">Premium</div>
                </div>
                <div>
                  <div className="text-slate-400">Member Since</div>
                  <div className="font-medium text-slate-200">Jan 2024</div>
                </div>
                <div>
                  <div className="text-slate-400">Status</div>
                  <div className="font-medium text-green-400">Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="professional-card p-6 bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-1">Account Actions</h3>
            <p className="text-sm text-slate-400">Manage your account security</p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-sm font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;