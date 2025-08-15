import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import ChartinkService from '../services/chartinkService';
import { 
  Users, Settings, MessageSquare, BarChart3, Plus, Edit, Trash2, Filter, Search, 
  LogOut, Send, Bell, User, Target, Play, Clock, 
  AlertCircle, CheckCircle, RefreshCw, ExternalLink, Save, X, TrendingUp, TrendingDown,
  ChevronDown, ChevronUp, Copy, Zap
} from 'lucide-react';

interface Screener {
  id: string;
  name: string;
  description?: string;
  formData: string;
  isActive: boolean;
  schedule: {
    interval: number; // minutes
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    enabled: boolean;
  };
  tags: string[];
  createdAt: Date;
  lastRun?: Date;
  nextRun?: Date;
  executionCount: number;
  successCount: number;
  failureCount: number;
  results?: any[];
}

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

  // Screener Management State
  const [screeners, setScreeners] = useState<Screener[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateScreener, setShowCreateScreener] = useState(false);
  const [editingScreener, setEditingScreener] = useState<Screener | null>(null);
  const [screenerFormData, setScreenerFormData] = useState({
    name: '',
    description: '',
    formData: '',
    tags: [] as string[],
    schedule: {
      interval: 30,
      startTime: '09:15',
      endTime: '15:30',
      enabled: true
    },
    isActive: true
  });
  const [tagInput, setTagInput] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [showTestResults, setShowTestResults] = useState(false);
  const [showExpandedResults, setShowExpandedResults] = useState(false);
  const [sampleFormData] = useState(ChartinkService.getSampleFormData());

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

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'screeners', label: 'Screener Management', icon: Target },
    { id: 'content', label: 'Menu Content', icon: Settings },
    { id: 'announcements', label: 'Announcements', icon: MessageSquare },
    { id: 'broadcast', label: 'Broadcast Alerts', icon: Bell },
    { id: 'messaging', label: 'User Messaging', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  // Mock screener data for demo
  useEffect(() => {
    if (activeTab === 'screeners') {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setScreeners([
          {
            id: '1',
            name: 'High Volume Breakout',
            description: 'Stocks breaking out with high volume above 10M',
            formData: 'max_rows=160&scan_clause=volume%20%3E%2010000000%20and%20close%20%3E%20sma(close%2C20)',
            isActive: true,
            schedule: {
              interval: 30,
              startTime: '09:15',
              endTime: '15:30',
              enabled: true
            },
            tags: ['volume', 'breakout', 'momentum'],
            createdAt: new Date('2024-01-15'),
            lastRun: new Date(),
            executionCount: 25,
            successCount: 23,
            failureCount: 2
          },
          {
            id: '2',
            name: 'RSI Oversold Recovery',
            description: 'Stocks showing RSI oversold recovery signals',
            formData: 'max_rows=100&scan_clause=rsi(14)%20%3C%2030%20and%20close%20%3E%20open',
            isActive: false,
            schedule: {
              interval: 60,
              startTime: '10:00',
              endTime: '14:30',
              enabled: false
            },
            tags: ['rsi', 'oversold', 'recovery'],
            createdAt: new Date('2024-01-10'),
            lastRun: new Date(Date.now() - 86400000),
            executionCount: 15,
            successCount: 14,
            failureCount: 1
          }
        ]);
        setLoading(false);
      }, 1000);
    }
  }, [activeTab]);

  // API functions for screeners
  const createScreener = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newScreener: Screener = {
        id: Date.now().toString(),
        ...screenerFormData,
        createdAt: new Date(),
        executionCount: 0,
        successCount: 0,
        failureCount: 0
      };
      
      setScreeners(prev => [...prev, newScreener]);
      setShowCreateScreener(false);
      resetScreenerForm();
      console.log('Screener created successfully');
    } catch (error) {
      console.error('Error creating screener:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateScreener = async (id: string) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setScreeners(prev => prev.map(s => 
        s.id === id ? { ...s, ...screenerFormData } : s
      ));
      setEditingScreener(null);
      resetScreenerForm();
      console.log('Screener updated successfully');
    } catch (error) {
      console.error('Error updating screener:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteScreener = async (id: string) => {
    if (!confirm('Are you sure you want to delete this screener?')) return;
    
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setScreeners(prev => prev.filter(s => s.id !== id));
      console.log('Screener deleted successfully');
    } catch (error) {
      console.error('Error deleting screener:', error);
    } finally {
      setLoading(false);
    }
  };

  const runScreener = async (id: string) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setScreeners(prev => prev.map(s => 
        s.id === id ? { 
          ...s, 
          lastRun: new Date(),
          executionCount: s.executionCount + 1,
          successCount: s.successCount + 1
        } : s
      ));
      console.log('Screener executed successfully');
    } catch (error) {
      console.error('Error running screener:', error);
    } finally {
      setLoading(false);
    }
  };

  const testChartinkConnection = async () => {
    if (!screenerFormData.formData.trim()) {
      setTestResult({ 
        success: false, 
        message: 'Please enter form data first',
        error: 'Form data is required'
      });
      return;
    }

    setTestingConnection(true);
    try {
      const result = await ChartinkService.testScreener(screenerFormData.formData);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const resetScreenerForm = () => {
    setScreenerFormData({
      name: '',
      description: '',
      formData: '',
      tags: [],
      schedule: {
        interval: 30,
        startTime: '09:15',
        endTime: '15:30',
        enabled: true
      },
      isActive: true
    });
    setTagInput('');
    setTestResult(null);
  };

  const addTag = (tag: string) => {
    if (tag && !screenerFormData.tags.includes(tag)) {
      setScreenerFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setScreenerFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const applySampleFormData = (formData: string) => {
    setScreenerFormData(prev => ({
      ...prev,
      formData
    }));
    setTestResult(null); // Clear previous test results
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const copyTestResults = async (testResult: any) => {
    try {
      const resultText = testResult.success 
        ? `Chartink Test Results\n==================\n\nStatus: Success\nStocks Found: ${testResult.sampleCount}\nResponse Time: ${testResult.responseTime}ms\n\nStock Data:\n${testResult.stocks?.map((stock: any) => 
            `${stock.symbol}: ₹${formatNumber(stock.ltp)} (${stock.change >= 0 ? '+' : ''}${formatNumber(stock.change)})`
          ).join('\n') || 'No stock data available'}`
        : `Chartink Test Results\n==================\n\nStatus: Failed\nError: ${testResult.message}`;
      
      await navigator.clipboard.writeText(resultText);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy test results: ', err);
    }
  };

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
    <div className="space-y-4 md:space-y-6">
      {/* Filters */}
      <div className="professional-card p-4 md:p-6 border border-slate-700/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 placeholder-slate-500 text-sm font-mono"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-mono"
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
              <option value="inactive">Inactive Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="professional-card overflow-hidden border border-slate-700/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">User</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">Phone</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">Status</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">Subscription</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30">
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-slate-200 font-mono">{user.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{user.email}</div>
                      <div className="text-xs text-slate-500 font-mono">{user.registrationDate.toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-200 font-mono">{user.phone || 'N/A'}</div>
                    <div className="text-xs text-slate-400 font-mono">{user.loginMethod}</div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-sm ${
                      user.isActive 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    } font-mono`}>
                      {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-slate-200 font-mono">
                      {user.subscriptionExpiry.toLocaleDateString()}
                    </div>
                    <div className={`text-xs font-mono ${
                      user.subscriptionExpiry > new Date() ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {user.subscriptionExpiry > new Date() ? 'VALID' : 'EXPIRED'}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => handleToggleUserStatus(user.id, !user.isActive)}
                        className={`px-2 py-1 text-xs font-medium transition-colors rounded-sm font-mono ${
                          user.isActive 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                            : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                        }`}
                      >
                        {user.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                      </button>
                      <button
                        onClick={() => handleExtendSubscription(user.id, 30)}
                        className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium hover:bg-blue-500/30 transition-colors rounded-sm font-mono"
                      >
                        +30D
                      </button>
                      <button
                        onClick={() => handleExtendSubscription(user.id, 120)}
                        className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-medium hover:bg-purple-500/30 transition-colors rounded-sm font-mono"
                      >
                        +4M
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

  const renderScreenerManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-200 font-mono">SCREENER MANAGEMENT</h2>
          <p className="text-slate-400 text-sm md:text-base font-mono">Manage Chartink screeners and automated execution</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
            disabled={loading}
            className="p-2 hover:bg-slate-700/50 rounded-sm transition-colors"
            title="Refresh screeners"
          >
            <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateScreener(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-sm font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-green-500/25 font-mono text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE SCREENER</span>
          </button>
        </div>
      </div>

      {/* Create/Edit Screener Form */}
      {(showCreateScreener || editingScreener) && (
        <div className="professional-card p-4 md:p-6 bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-200 font-mono">
                {editingScreener ? 'EDIT SCREENER' : 'CREATE NEW SCREENER'}
              </h3>
              <p className="text-slate-400 text-sm font-mono">Configure Chartink screener with automated scheduling</p>
            </div>
            <button
              onClick={() => {
                setShowCreateScreener(false);
                setEditingScreener(null);
                resetScreenerForm();
              }}
              className="p-2 hover:bg-slate-700/50 rounded-sm transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 font-mono">
                  Screener Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={screenerFormData.name}
                  onChange={(e) => setScreenerFormData({...screenerFormData, name: e.target.value})}
                  placeholder="Enter screener name"
                  className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 placeholder-slate-500 font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 font-mono">
                  Status
                </label>
                <div className="flex items-center space-x-3 p-3 bg-slate-800/60 border border-slate-600/50 rounded-sm">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={screenerFormData.isActive}
                    onChange={(e) => setScreenerFormData({...screenerFormData, isActive: e.target.checked})}
                    className="rounded border-slate-600 text-green-500 focus:ring-green-500/50"
                  />
                  <label htmlFor="isActive" className="text-sm text-slate-200 font-mono">
                    Active screener
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 font-mono">
                Description
              </label>
              <textarea
                value={screenerFormData.description}
                onChange={(e) => setScreenerFormData({...screenerFormData, description: e.target.value})}
                placeholder="Enter screener description"
                rows={3}
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 placeholder-slate-500 font-mono"
              />
            </div>

            {/* Chartink Form Data */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 font-mono">
                Chartink Form Data <span className="text-red-400">*</span>
              </label>
              <div className="space-y-3">
                <textarea
                  value={screenerFormData.formData}
                  onChange={(e) => setScreenerFormData({...screenerFormData, formData: e.target.value})}
                  placeholder="max_rows=160&scan_clause=volume%20%3E%2010000000"
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 placeholder-slate-500 font-mono text-xs"
                />
                <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
                  <button
                    type="button"
                    onClick={testChartinkConnection}
                    disabled={testingConnection || !screenerFormData.formData}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-sm font-semibold transition-colors font-mono text-sm"
                  >
                    {testingConnection ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                    <span>TEST CONNECTION</span>
                  </button>
                  
                  {/* Sample Form Data Quick Access */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ChartinkService.getSampleFormData()).map(([name, data]) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setScreenerFormData({...screenerFormData, formData: data})}
                        className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white border border-slate-600/50 hover:border-slate-500 rounded-sm text-xs font-mono transition-colors"
                        title={`Apply ${name} sample data`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  
                  {testResult && (
                    <div className="space-y-3">
                      {/* Test Status Header */}
                      <div className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                        testResult.success 
                          ? 'bg-green-900/20 border border-green-700/30' 
                          : 'bg-red-900/20 border border-red-700/30'
                      }`}>
                        <div className="flex items-center space-x-3">
                          {testResult.success ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          )}
                          <div>
                            <div className={`font-semibold text-sm ${testResult.success ? 'text-green-300' : 'text-red-300'}`}>
                              {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              {testResult.success 
                                ? `${testResult.sampleCount} stocks found • ${testResult.responseTime}ms response`
                                : testResult.message
                              }
                            </div>
                          </div>
                        </div>
                        
                        {testResult.success && testResult.stocks && testResult.stocks.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => copyTestResults(testResult)}
                              className="p-2 hover:bg-white/10 rounded transition-colors"
                              title="Copy test results"
                            >
                              <Copy className="w-4 h-4 text-slate-400 hover:text-white" />
                            </button>
                            <button
                              onClick={() => setShowExpandedResults(!showExpandedResults)}
                              className="p-2 hover:bg-white/10 rounded transition-colors"
                              title="Toggle detailed view"
                            >
                              {showExpandedResults ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Expanded Results */}
                      {showExpandedResults && testResult.success && testResult.stocks && (
                        <div className="bg-slate-800/40 border border-slate-600/30 rounded-lg overflow-hidden">
                          <div className="px-4 py-2 bg-slate-700/30 border-b border-slate-600/30">
                            <div className="text-sm font-semibold text-slate-300">Sample Stock Data</div>
                            <div className="text-xs text-slate-400">Showing first {testResult.stocks.length} results</div>
                          </div>
                          
                          <div className="max-h-64 overflow-y-auto professional-scroll">
                            <table className="w-full">
                              <thead className="bg-slate-700/20 sticky top-0">
                                <tr className="text-xs font-mono text-slate-400">
                                  <th className="text-left py-2 px-3 border-b border-slate-600/20">Symbol</th>
                                  <th className="text-left py-2 px-3 border-b border-slate-600/20">Name</th>
                                  <th className="text-right py-2 px-3 border-b border-slate-600/20">LTP</th>
                                  <th className="text-right py-2 px-3 border-b border-slate-600/20">Change</th>
                                  <th className="text-right py-2 px-3 border-b border-slate-600/20">Volume</th>
                                </tr>
                              </thead>
                              <tbody>
                                {testResult.stocks.map((stock, index) => (
                                  <tr key={index} className="text-xs hover:bg-slate-700/20 transition-colors">
                                    <td className="py-2 px-3 font-mono text-slate-300 border-b border-slate-700/20">{stock.symbol}</td>
                                    <td className="py-2 px-3 text-slate-400 border-b border-slate-700/20 truncate max-w-32">{stock.name}</td>
                                    <td className="py-2 px-3 text-right font-mono text-slate-300 border-b border-slate-700/20">
                                      ₹{formatNumber(stock.ltp)}
                                    </td>
                                    <td className={`py-2 px-3 text-right font-mono border-b border-slate-700/20 ${
                                      stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                      {stock.change >= 0 ? '+' : ''}{formatNumber(stock.change)} ({formatNumber(stock.pchange)}%)
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono text-slate-400 border-b border-slate-700/20">
                                      {formatNumber(stock.volume)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Error Details */}
                      {!testResult.success && testResult.error && (
                        <div className="bg-red-900/10 border border-red-700/20 rounded-lg p-4">
                          <div className="text-sm font-medium text-red-300 mb-2">Error Details</div>
                          <div className="text-xs font-mono text-red-400 bg-red-900/20 rounded p-2">
                            {testResult.error}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 font-mono">
                Tags
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {screenerFormData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-900/30 border border-blue-700/50 rounded-sm text-blue-300 text-sm font-mono">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-400 hover:text-blue-300 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(tagInput.trim());
                      }
                    }}
                    placeholder="Add a tag (e.g., volume, breakout)"
                    className="flex-1 px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 placeholder-slate-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => addTag(tagInput.trim())}
                    disabled={!tagInput.trim()}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-sm transition-colors font-mono"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Schedule Configuration */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-sm p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-slate-400" />
                <h4 className="text-sm font-semibold text-slate-200 font-mono">SCHEDULE CONFIGURATION</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 font-mono">
                    Interval (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={screenerFormData.schedule.interval}
                    onChange={(e) => setScreenerFormData({
                      ...screenerFormData,
                      schedule: {
                        ...screenerFormData.schedule,
                        interval: parseInt(e.target.value) || 30
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 font-mono">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={screenerFormData.schedule.startTime}
                    onChange={(e) => setScreenerFormData({
                      ...screenerFormData,
                      schedule: {
                        ...screenerFormData.schedule,
                        startTime: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 font-mono">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={screenerFormData.schedule.endTime}
                    onChange={(e) => setScreenerFormData({
                      ...screenerFormData,
                      schedule: {
                        ...screenerFormData.schedule,
                        endTime: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 font-mono"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="scheduleEnabled"
                    checked={screenerFormData.schedule.enabled}
                    onChange={(e) => setScreenerFormData({
                      ...screenerFormData,
                      schedule: {
                        ...screenerFormData.schedule,
                        enabled: e.target.checked
                      }
                    })}
                    className="rounded border-slate-600 text-green-500 focus:ring-green-500/50"
                  />
                  <label htmlFor="scheduleEnabled" className="text-sm text-slate-200 font-mono">
                    Enable automated scheduling
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-3 md:space-y-0 md:space-x-3 pt-4">
              <button
                onClick={() => {
                  if (editingScreener) {
                    updateScreener(editingScreener.id);
                  } else {
                    createScreener();
                  }
                }}
                disabled={loading || !screenerFormData.name || !screenerFormData.formData}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-sm font-semibold hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-1 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-green-500/25 font-mono text-sm"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{editingScreener ? 'UPDATE SCREENER' : 'CREATE SCREENER'}</span>
              </button>
              
              <button
                onClick={() => {
                  setShowCreateScreener(false);
                  setEditingScreener(null);
                  resetScreenerForm();
                }}
                className="px-6 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-sm hover:bg-slate-600 transition-colors font-semibold font-mono text-sm"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screeners List */}
      <div className="professional-card p-4 md:p-6 bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200 font-mono">ACTIVE SCREENERS</h3>
          <div className="text-sm text-slate-400 font-mono">
            {screeners.filter(s => s.isActive).length} of {screeners.length} active
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-slate-400 font-mono">LOADING SCREENERS...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {screeners.map((screener) => (
              <div key={screener.id} className="border border-slate-700/50 rounded-sm p-4 bg-slate-800/30 hover:border-slate-600/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 mb-2">
                      <h4 className="text-base font-semibold text-slate-200 font-mono">{screener.name}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-sm ${
                        screener.isActive 
                          ? 'bg-green-900/30 border border-green-700/50 text-green-300' 
                          : 'bg-red-900/30 border border-red-700/50 text-red-300'
                      } font-mono`}>
                        {screener.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    
                    {screener.description && (
                      <p className="text-sm text-slate-400 mb-2 font-mono">{screener.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500">Schedule:</span>
                        <div className="text-slate-300">Every {screener.schedule.interval}m</div>
                        <div className="text-slate-400">{screener.schedule.startTime} - {screener.schedule.endTime}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Executions:</span>
                        <div className="text-slate-300">{screener.executionCount}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Success Rate:</span>
                        <div className="text-green-400">
                          {screener.executionCount > 0 
                            ? Math.round((screener.successCount / screener.executionCount) * 100)
                            : 0
                          }%
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">Last Run:</span>
                        <div className="text-slate-300">
                          {screener.lastRun 
                            ? screener.lastRun.toLocaleString()
                            : 'Never'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingScreener(screener);
                        setScreenerFormData({
                          name: screener.name,
                          description: screener.description || '',
                          formData: screener.formData,
                          tags: screener.tags,
                          schedule: screener.schedule,
                          isActive: screener.isActive
                        });
                      }}
                      className="p-2 hover:bg-slate-700/50 rounded-sm transition-colors text-slate-400 hover:text-blue-400"
                      title="Edit screener"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => runScreener(screener.id)}
                      disabled={loading}
                      className="p-2 hover:bg-slate-700/50 rounded-sm transition-colors text-slate-400 hover:text-green-400 disabled:opacity-50"
                      title="Run now"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteScreener(screener.id)}
                      disabled={loading}
                      className="p-2 hover:bg-slate-700/50 rounded-sm transition-colors text-slate-400 hover:text-red-400 disabled:opacity-50"
                      title="Delete screener"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {screeners.length === 0 && (
              <div className="text-center py-12">
                <Target className="w-12 h-12 md:w-16 md:h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2 font-mono">NO SCREENERS FOUND</h3>
                <p className="text-slate-400 mb-6 font-mono">Create your first Chartink screener to get started</p>
                <button
                  onClick={() => setShowCreateScreener(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-sm font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-green-500/25 font-mono"
                >
                  CREATE FIRST SCREENER
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderBroadcastAlerts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-200 font-mono">BROADCAST ALERT SYSTEM</h2>
        <button
          onClick={() => setShowBroadcastAlert(true)}
          className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-sm hover:from-red-700 hover:to-orange-700 flex items-center space-x-2 font-mono"
        >
          <Bell className="w-4 h-4" />
          <span>SEND ALERT</span>
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
        <h2 className="text-xl font-semibold text-slate-200 font-mono">USER MESSAGING</h2>
        <button
          onClick={() => setShowMessaging(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-sm hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2 font-mono"
        >
          <MessageSquare className="w-4 h-4" />
          <span>SEND MESSAGE</span>
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
        <div className="professional-card p-4 border border-slate-700/50">
          <div className="text-2xl font-bold text-slate-200 font-mono">{users.length}</div>
          <div className="text-sm text-slate-400 font-mono">Total Users</div>
        </div>
        <div className="professional-card p-4 border border-slate-700/50">
          <div className="text-2xl font-bold text-green-400 font-mono">{users.filter(u => u.isActive).length}</div>
          <div className="text-sm text-slate-400 font-mono">Active Users</div>
        </div>
        <div className="professional-card p-4 border border-slate-700/50">
          <div className="text-2xl font-bold text-purple-400 font-mono">{users.filter(u => u.isPaidUser).length}</div>
          <div className="text-sm text-slate-400 font-mono">Paid Users</div>
        </div>
        <div className="professional-card p-4 border border-slate-700/50">
          <div className="text-2xl font-bold text-orange-400 font-mono">{announcements.length}</div>
          <div className="text-sm text-slate-400 font-mono">Announcements</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-200 font-mono">ADMIN DASHBOARD</h1>
          <p className="text-slate-400 mt-1 text-base md:text-lg font-mono">Welcome back, {admin?.username}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-900/30 border border-green-700/50 rounded-sm">
            <BarChart3 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-mono text-green-300">{users.length} Users</span>
          </div>
          <button
            onClick={logoutAdmin}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-sm font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-200 text-sm shadow-lg hover:shadow-red-500/25 font-mono"
          >
            <LogOut className="w-4 h-4" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 professional-card bg-slate-800/50 border-b md:border-b-0 md:border-r border-slate-700/50">
          <nav className="p-3 space-y-1 flex md:flex-col overflow-x-auto md:overflow-x-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-3 py-3 transition-colors text-sm font-semibold rounded-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent'
                  } font-mono`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 bg-slate-900">
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