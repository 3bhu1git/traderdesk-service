import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Users, Settings, MessageSquare, BarChart3, Calendar, Plus, Edit, Trash2, Filter, Search, LogOut, Send, Bell, User, Target, Eye, Play, Pause } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { 
    admin, 
    users, 
    menuContent, 
    announcements, 
    logoutAdmin, 
    updateUser, 
    extendSubscription, 
    updateMenuContent, 
    addAnnouncement 
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('users');
  const [userFilter, setUserFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    userName: '',
    stockSymbol: '',
    profit: 0,
    percentage: 0,
    tradeType: 'buy' as 'buy' | 'sell'
  });

  // Broadcast Alert State
  const [showBroadcastAlert, setShowBroadcastAlert] = useState(false);
  const [broadcastAlert, setBroadcastAlert] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Individual Messaging State
  const [showMessaging, setShowMessaging] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageSubject, setMessageSubject] = useState('');

  // Screener Management State
  const [screeners, setScreeners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateScreener, setShowCreateScreener] = useState(false);
  const [editingScreener, setEditingScreener] = useState<any | null>(null);
  const [screenerFormData, setScreenerFormData] = useState({
    name: '',
    description: '',
    chartinkUrl: '',
    triggerTime: '',
    frequency: 'daily',
    customFrequency: {
      interval: 1,
      unit: 'hours'
    },
    isActive: true
  });

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'screeners', label: 'Screener Management', icon: Target },
    { id: 'content', label: 'Menu Content', icon: Settings },
    { id: 'announcements', label: 'Announcements', icon: MessageSquare },
    { id: 'broadcast', label: 'Broadcast Alerts', icon: Bell },
    { id: 'messaging', label: 'User Messaging', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  // API functions for screeners
  const fetchScreeners = async () => {
    setLoading(true);
    try {
      const adminData = localStorage.getItem('traderdesk_admin');
      if (!adminData) throw new Error('No admin session');
      
      // Use development bypass for admin access
      const response = await fetch('/api/chartink-screeners', {
        headers: {
          'x-dev-bypass': 'true',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setScreeners(data.data.screeners || []);
      } else {
        console.error('Failed to fetch screeners');
      }
    } catch (error) {
      console.error('Error fetching screeners:', error);
    } finally {
      setLoading(false);
    }
  };

  const createScreener = async (screenerData: any) => {
    try {
      const adminData = localStorage.getItem('traderdesk_admin');
      if (!adminData) throw new Error('No admin session');
      
      const response = await fetch('/api/chartink-screeners', {
        method: 'POST',
        headers: {
          'x-dev-bypass': 'true',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(screenerData)
      });
      
      if (response.ok) {
        fetchScreeners();
        setShowCreateScreener(false);
        resetScreenerForm();
        alert('Screener created successfully');
      } else {
        const error = await response.json();
        alert(`Failed to create screener: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating screener:', error);
      alert('Error creating screener');
    }
  };

  const updateScreener = async (id: string, screenerData: any) => {
    try {
      const adminData = localStorage.getItem('traderdesk_admin');
      if (!adminData) throw new Error('No admin session');
      
      const response = await fetch(`/api/chartink-screeners/${id}`, {
        method: 'PUT',
        headers: {
          'x-dev-bypass': 'true',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(screenerData)
      });
      
      if (response.ok) {
        fetchScreeners();
        setEditingScreener(null);
        resetScreenerForm();
        alert('Screener updated successfully');
      } else {
        const error = await response.json();
        alert(`Failed to update screener: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating screener:', error);
      alert('Error updating screener');
    }
  };

  const deleteScreener = async (id: string) => {
    if (!confirm('Are you sure you want to delete this screener?')) return;
    
    try {
      const adminData = localStorage.getItem('traderdesk_admin');
      if (!adminData) throw new Error('No admin session');
      
      const response = await fetch(`/api/chartink-screeners/${id}`, {
        method: 'DELETE',
        headers: {
          'x-dev-bypass': 'true',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchScreeners();
        alert('Screener deleted successfully');
      } else {
        const error = await response.json();
        alert(`Failed to delete screener: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting screener:', error);
      alert('Error deleting screener');
    }
  };

  const runScreener = async (id: string) => {
    try {
      const adminData = localStorage.getItem('traderdesk_admin');
      if (!adminData) throw new Error('No admin session');
      
      const response = await fetch(`/api/chartink-screeners/${id}/run`, {
        method: 'POST',
        headers: {
          'x-dev-bypass': 'true',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchScreeners();
        alert('Screener run initiated successfully');
      } else {
        const error = await response.json();
        alert(`Failed to run screener: ${error.message}`);
      }
    } catch (error) {
      console.error('Error running screener:', error);
      alert('Error running screener');
    }
  };

  const resetScreenerForm = () => {
    setScreenerFormData({
      name: '',
      description: '',
      chartinkUrl: '',
      triggerTime: '',
      frequency: 'daily',
      customFrequency: {
        interval: 1,
        unit: 'hours'
      },
      isActive: true
    });
  };

  // Load screeners on component mount
  useEffect(() => {
    if (admin && activeTab === 'screeners') {
      fetchScreeners();
    }
  }, [admin, activeTab]);

  const filteredUsers = users.filter(user => {
    const matchesFilter = userFilter === 'all' || 
      (userFilter === 'active' && user.isActive) ||
      (userFilter === 'inactive' && !user.isActive);
    
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    
    return matchesFilter && matchesSearch;
  });

  const handleExtendSubscription = (userId: string, days: number) => {
    extendSubscription(userId, days);
  };

  const handleToggleUserStatus = (userId: string, isActive: boolean) => {
    updateUser(userId, { isActive });
  };

  const handleAddAnnouncement = () => {
    if (newAnnouncement.userName && newAnnouncement.stockSymbol) {
      addAnnouncement({
        ...newAnnouncement,
        userId: 'admin',
        date: new Date()
      });
      setNewAnnouncement({
        userName: '',
        stockSymbol: '',
        profit: 0,
        percentage: 0,
        tradeType: 'buy'
      });
    }
  };

  const handleSendBroadcastAlert = () => {
    if (broadcastAlert.title && broadcastAlert.message) {
      // In real implementation, this would send to all users
      console.log('Broadcasting alert:', broadcastAlert);
      alert(`Broadcast alert sent to all ${users.length} users!`);
      setBroadcastAlert({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium'
      });
      setShowBroadcastAlert(false);
    }
  };

  const handleSendMessage = () => {
    if (selectedUser && messageSubject && messageText) {
      const user = users.find(u => u.id === selectedUser);
      console.log('Sending message to:', user?.name, { subject: messageSubject, message: messageText });
      alert(`Message sent to ${user?.name}!`);
      setMessageSubject('');
      setMessageText('');
      setSelectedUser(null);
      setShowMessaging(false);
    }
  };

  const renderUserManagement = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
              <option value="inactive">Inactive Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Compact Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">{user.registrationDate.toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.phone || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{user.loginMethod}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-xs text-gray-900">
                      {user.subscriptionExpiry.toLocaleDateString()}
                    </div>
                    <div className={`text-xs ${
                      user.subscriptionExpiry > new Date() ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {user.subscriptionExpiry > new Date() ? 'Valid' : 'Expired'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => handleToggleUserStatus(user.id, !user.isActive)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.isActive 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleExtendSubscription(user.id, 30)}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200"
                      >
                        +30d
                      </button>
                      <button
                        onClick={() => handleExtendSubscription(user.id, 120)}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200"
                      >
                        +4m
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user.id);
                          setShowMessaging(true);
                        }}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200"
                      >
                        Message
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBroadcastAlerts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Broadcast Alert System</h2>
        <button
          onClick={() => setShowBroadcastAlert(true)}
          className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-orange-700 flex items-center space-x-2"
        >
          <Bell className="w-4 h-4" />
          <span>Send Broadcast Alert</span>
        </button>
      </div>

      {showBroadcastAlert && (
        <div className="glass-card p-6 border border-red-200 bg-red-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Broadcast Alert</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alert Title</label>
              <input
                type="text"
                value={broadcastAlert.title}
                onChange={(e) => setBroadcastAlert({...broadcastAlert, title: e.target.value})}
                placeholder="Enter alert title..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alert Message</label>
              <textarea
                value={broadcastAlert.message}
                onChange={(e) => setBroadcastAlert({...broadcastAlert, message: e.target.value})}
                placeholder="Enter alert message..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alert Type</label>
                <select
                  value={broadcastAlert.type}
                  onChange={(e) => setBroadcastAlert({...broadcastAlert, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={broadcastAlert.priority}
                  onChange={(e) => setBroadcastAlert({...broadcastAlert, priority: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSendBroadcastAlert}
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-orange-700 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send to All Users ({users.length})</span>
              </button>
              <button
                onClick={() => setShowBroadcastAlert(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Broadcast Alerts</h3>
        <div className="space-y-3">
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-red-900">Market Volatility Alert</h4>
              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">High Priority</span>
            </div>
            <p className="text-sm text-red-800 mb-2">High volatility expected in banking sector. Please review your positions.</p>
            <div className="text-xs text-red-600">Sent 2 hours ago • 1,234 users reached</div>
          </div>
          
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">System Maintenance Notice</h4>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Medium Priority</span>
            </div>
            <p className="text-sm text-blue-800 mb-2">Scheduled maintenance tonight from 11 PM to 1 AM IST.</p>
            <div className="text-xs text-blue-600">Sent 1 day ago • 1,234 users reached</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserMessaging = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Individual User Messaging</h2>
        <button
          onClick={() => setShowMessaging(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Send Message</span>
        </button>
      </div>

      {showMessaging && (
        <div className="glass-card p-6 border border-green-200 bg-green-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Message to User</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
              <select
                value={selectedUser || ''}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choose a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Enter message subject..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter your message..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSendMessage}
                disabled={!selectedUser || !messageSubject || !messageText}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
              <button
                onClick={() => {
                  setShowMessaging(false);
                  setSelectedUser(null);
                  setMessageSubject('');
                  setMessageText('');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h3>
        <div className="space-y-3">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">John Doe</span>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Welcome to Premium Features</h4>
            <p className="text-sm text-gray-600">Thank you for upgrading to premium. Here's how to get started...</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">Jane Smith</span>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Account Verification Complete</h4>
            <p className="text-sm text-gray-600">Your account has been successfully verified. You now have access to all features.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentManagement = () => (
    <div className="space-y-4">
      {menuContent.map((content) => (
        <div key={content.id} className="glass-card p-4">
          {editingContent === content.id ? (
            <div className="space-y-3">
              <input
                type="text"
                value={content.title}
                onChange={(e) => updateMenuContent(content.id, { title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <textarea
                value={content.description}
                onChange={(e) => updateMenuContent(content.id, { description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                rows={2}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingContent(null)}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingContent(null)}
                  className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{content.title}</h3>
                <p className="text-gray-600 mb-3 text-sm">{content.description}</p>
                <div className="flex flex-wrap gap-1">
                  {content.features.map((feature, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateMenuContent(content.id, { isActive: !content.isActive })}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    content.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {content.isActive ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => setEditingContent(content.id)}
                  className="p-1 text-gray-600 hover:text-purple-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderAnnouncementManagement = () => (
    <div className="space-y-4">
      {/* Add New Announcement */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Add New Announcement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="User Name"
            value={newAnnouncement.userName}
            onChange={(e) => setNewAnnouncement({...newAnnouncement, userName: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <input
            type="text"
            placeholder="Stock Symbol"
            value={newAnnouncement.stockSymbol}
            onChange={(e) => setNewAnnouncement({...newAnnouncement, stockSymbol: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <input
            type="number"
            placeholder="Profit Amount"
            value={newAnnouncement.profit}
            onChange={(e) => setNewAnnouncement({...newAnnouncement, profit: Number(e.target.value)})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <input
            type="number"
            placeholder="Profit Percentage"
            value={newAnnouncement.percentage}
            onChange={(e) => setNewAnnouncement({...newAnnouncement, percentage: Number(e.target.value)})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
        <div className="mt-3 flex items-center space-x-3">
          <select
            value={newAnnouncement.tradeType}
            onChange={(e) => setNewAnnouncement({...newAnnouncement, tradeType: e.target.value as 'buy' | 'sell'})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          <button
            onClick={handleAddAnnouncement}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 flex items-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="glass-card">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {announcement.userName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{announcement.userName}</div>
                  <div className="text-sm text-gray-600">{announcement.stockSymbol}</div>
                  <div className="text-xs text-gray-500">{announcement.date.toLocaleDateString()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-600 font-bold text-sm">+₹{announcement.profit.toLocaleString()}</div>
                <div className="text-xs text-green-600">+{announcement.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.isPaidUser).length}</div>
          <div className="text-sm text-gray-600">Paid Users</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-2xl font-bold text-orange-600">{announcements.length}</div>
          <div className="text-sm text-gray-600">Announcements</div>
        </div>
      </div>
    </div>
  );

  const renderScreenerManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Screener Management</h2>
        <button
          onClick={() => setShowCreateScreener(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Screener</span>
        </button>
      </div>

      {/* Create/Edit Screener Form */}
      {(showCreateScreener || editingScreener) && (
        <div className="glass-card p-6 border border-purple-200 bg-purple-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingScreener ? 'Edit Screener' : 'Create New Screener'}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={screenerFormData.name}
                  onChange={(e) => setScreenerFormData({...screenerFormData, name: e.target.value})}
                  placeholder="Enter screener name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Time *</label>
                <input
                  type="time"
                  value={screenerFormData.triggerTime}
                  onChange={(e) => setScreenerFormData({...screenerFormData, triggerTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={screenerFormData.description}
                onChange={(e) => setScreenerFormData({...screenerFormData, description: e.target.value})}
                placeholder="Enter screener description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chartink URL *</label>
              <input
                type="url"
                value={screenerFormData.chartinkUrl}
                onChange={(e) => setScreenerFormData({...screenerFormData, chartinkUrl: e.target.value})}
                placeholder="https://chartink.com/screener/..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency *</label>
                <select
                  value={screenerFormData.frequency}
                  onChange={(e) => setScreenerFormData({...screenerFormData, frequency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {screenerFormData.frequency === 'custom' && (
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interval</label>
                    <input
                      type="number"
                      min="1"
                      value={screenerFormData.customFrequency.interval}
                      onChange={(e) => setScreenerFormData({
                        ...screenerFormData,
                        customFrequency: {
                          ...screenerFormData.customFrequency,
                          interval: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                    <select
                      value={screenerFormData.customFrequency.unit}
                      onChange={(e) => setScreenerFormData({
                        ...screenerFormData,
                        customFrequency: {
                          ...screenerFormData.customFrequency,
                          unit: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={screenerFormData.isActive}
                onChange={(e) => setScreenerFormData({...screenerFormData, isActive: e.target.checked})}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  if (editingScreener) {
                    updateScreener(editingScreener._id, screenerFormData);
                  } else {
                    createScreener(screenerFormData);
                  }
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 flex items-center space-x-2"
              >
                <span>{editingScreener ? 'Update' : 'Create'} Screener</span>
              </button>
              <button
                onClick={() => {
                  setShowCreateScreener(false);
                  setEditingScreener(null);
                  resetScreenerForm();
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screeners List */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-600">Loading screeners...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screener</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {screeners.map((screener) => (
                  <tr key={screener._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{screener.name}</div>
                        <div className="text-xs text-gray-500">{screener.description}</div>
                        <div className="text-xs text-blue-600 hover:text-blue-800">
                          <a href={screener.chartinkUrl} target="_blank" rel="noopener noreferrer">
                            View on Chartink
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {screener.frequency === 'custom' 
                          ? `Every ${screener.customFrequency?.interval} ${screener.customFrequency?.unit}`
                          : screener.frequency.charAt(0).toUpperCase() + screener.frequency.slice(1)
                        }
                      </div>
                      <div className="text-xs text-gray-500">at {screener.triggerTime}</div>
                      {screener.nextRun && (
                        <div className="text-xs text-gray-500">
                          Next: {new Date(screener.nextRun).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        screener.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {screener.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {screener.lastRun 
                          ? new Date(screener.lastRun).toLocaleString()
                          : 'Never'
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        Runs: {screener.runCount || 0}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => {
                            setEditingScreener(screener);
                            setScreenerFormData({
                              name: screener.name,
                              description: screener.description || '',
                              chartinkUrl: screener.chartinkUrl,
                              triggerTime: screener.triggerTime,
                              frequency: screener.frequency,
                              customFrequency: screener.customFrequency || { interval: 1, unit: 'hours' },
                              isActive: screener.isActive
                            });
                          }}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => runScreener(screener._id)}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200"
                          title="Run Now"
                        >
                          <Play className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => updateScreener(screener._id, { isActive: !screener.isActive })}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            screener.isActive 
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title={screener.isActive ? 'Pause' : 'Resume'}
                        >
                          {screener.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => deleteScreener(screener._id)}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {screeners.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No screeners found. Create your first screener to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm">Welcome back, {admin?.username}</p>
          </div>
          <button
            onClick={logoutAdmin}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-56 bg-white shadow-sm h-screen sticky top-0">
          <nav className="p-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          {activeTab === 'users' && renderUserManagement()}
          {activeTab === 'screeners' && renderScreenerManagement()}
          {activeTab === 'content' && renderContentManagement()}
          {activeTab === 'announcements' && renderAnnouncementManagement()}
          {activeTab === 'broadcast' && renderBroadcastAlerts()}
          {activeTab === 'messaging' && renderUserMessaging()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;