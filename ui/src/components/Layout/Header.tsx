import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, ChevronDown, Link as LinkIcon, MessageSquare, X, Activity, TrendingUp, AlertTriangle, Settings, Power } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BrokerService from '../../services/brokerService';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showBrokerDropdown, setShowBrokerDropdown] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed'>('closed');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [connectedBrokers, setConnectedBrokers] = useState<any[]>([]);
  const [liveAccountsData, setLiveAccountsData] = useState<{ count: number; total: number }>({ count: 0, total: 0 });
  const [liveDataEnabled, setLiveDataEnabled] = useState(false);
  const [primaryDataBroker, setPrimaryDataBroker] = useState<any>(null);

  // Mock alerts data
  const alerts = [
    {
      id: 1,
      type: 'price',
      title: 'RELIANCE Price Alert',
      message: 'RELIANCE crossed ₹2500.00 resistance level',
      time: '2 min ago',
      isRead: false,
      priority: 'high',
      value: '+2.3%'
    },
    {
      id: 2,
      type: 'volume',
      title: 'Unusual Volume Detected',
      message: 'ADANIPORTS showing 300% above average volume',
      time: '5 min ago',
      isRead: false,
      priority: 'high',
      value: '45.2M'
    },
    {
      id: 3,
      type: 'news',
      title: 'Market News Alert',
      message: 'RBI announces interest rate decision',
      time: '15 min ago',
      isRead: false,
      priority: 'medium',
      value: 'RBI'
    },
    {
      id: 4,
      type: 'system',
      title: 'System Status',
      message: 'All trading systems operational',
      time: '1 hour ago',
      isRead: true,
      priority: 'low',
      value: 'OK'
    }
  ];

  // Mock messages data
  const messages = [
    {
      id: 1,
      from: 'Risk Management',
      subject: 'Portfolio Risk Assessment',
      preview: 'Daily risk metrics and exposure analysis ready for review...',
      time: '10 min ago',
      isRead: false,
      avatar: '⚠️',
      priority: 'high'
    },
    {
      id: 2,
      from: 'Trading Desk',
      subject: 'Market Opening Summary',
      preview: 'Pre-market analysis and key levels for today\'s session...',
      time: '1 hour ago',
      isRead: false,
      avatar: '📊',
      priority: 'medium'
    },
    {
      id: 3,
      from: 'Compliance',
      subject: 'Trade Compliance Report',
      preview: 'Weekly compliance review completed successfully...',
      time: '1 day ago',
      isRead: true,
      avatar: '✅',
      priority: 'low'
    }
  ];

  const unreadAlertsCount = alerts.filter(alert => !alert.isRead).length;
  const unreadMessagesCount = messages.filter(msg => !msg.isRead).length;

  // Check for connected brokers and live data status
  useEffect(() => {
    const checkConnectedBrokers = async () => {
      const brokers = [];
      
      // Check for Dhan using BrokerService
      if (BrokerService.isDhanConnected()) {
        const credentials = BrokerService.getDhanCredentials();
        if (credentials) {
          brokers.push({
            id: 1,
            name: 'Dhan',
            status: 'connected',
            logo: '🟢',
            latency: '8ms',
            clientId: credentials.clientId
          });
        }
      }
      
      setConnectedBrokers(brokers);
      
      // Get live accounts data
      const liveData = await BrokerService.getLiveAccountsCount();
      setLiveAccountsData(liveData);
      
      // Get live data status
      try {
        const liveDataStatus = await BrokerService.getLiveDataStatus();
        if (liveDataStatus.success && liveDataStatus.data) {
          setLiveDataEnabled(liveDataStatus.data.enabled);
          setPrimaryDataBroker(liveDataStatus.data.primaryBroker);
        }
      } catch (error) {
        console.error('Error fetching live data status:', error);
      }
    };
    
    checkConnectedBrokers();
    
    // Set up interval to periodically check for connected brokers
    const interval = setInterval(checkConnectedBrokers, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Handle live data toggle
  const handleLiveDataToggle = async () => {
    try {
      const newState = !liveDataEnabled;
      const result = await BrokerService.toggleLiveDataIntegration(newState);
      
      if (result.success) {
        setLiveDataEnabled(newState);
        // Optionally show a success message
      } else {
        // Handle error - could show notification
        console.error('Failed to toggle live data:', result.message);
      }
    } catch (error) {
      console.error('Error toggling live data:', error);
    }
  };

  // Check market status based on current time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Check if it's a weekday (Monday-Friday)
      const day = now.getDay();
      const isWeekday = day >= 1 && day <= 5;
      
      // Check if it's between 9:15 AM and 3:30 PM IST
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isMarketHours = (
        (hours > 9 || (hours === 9 && minutes >= 15)) && // After 9:15 AM
        (hours < 15 || (hours === 15 && minutes <= 30))  // Before 3:30 PM
      );
      
      setMarketStatus(isWeekday && isMarketHours ? 'open' : 'closed');
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBrokerDropdown(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setShowAlertsDropdown(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setShowMessagesDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-900/50 text-red-300 border-red-700/50';
      case 'medium': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50';
      case 'low': return 'bg-blue-900/50 text-blue-300 border-blue-700/50';
      default: return 'bg-slate-800/50 text-slate-300 border-slate-700/50';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price': return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'volume': return <Activity className="w-3 h-3 text-blue-400" />;
      case 'news': return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
      case 'system': return <Settings className="w-3 h-3 text-slate-400" />;
      default: return <Bell className="w-3 h-3 text-slate-400" />;
    }
  };

  const handleViewAllMessages = () => {
    setShowMessagesDropdown(false);
    navigate('/chat');
  };

  return (
    <header className="bg-slate-900/98 backdrop-blur-xl border-b border-slate-700/50 px-3 sm:px-4 py-2 sm:py-3 relative z-50 fixed top-0 left-0 right-0 h-14">
      <div className="flex items-center justify-between h-full">
        {/* Left Section */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-sm hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
          
          {/* Market Status Indicator */}
          <div className={`flex items-center space-x-2 px-3 py-1.5 ${
            marketStatus === 'open' 
              ? 'bg-green-900/30 border border-green-700/50' 
              : 'bg-red-900/30 border border-red-700/50'
          } rounded-sm`}>
            <div className={`w-2 h-2 ${
              marketStatus === 'open' ? 'bg-green-400' : 'bg-red-400'
            } rounded-full animate-pulse`}></div>
            <span className={`text-sm font-mono ${
              marketStatus === 'open' ? 'text-green-300' : 'text-red-300'
            }`}>
              MARKET {marketStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Live Data Toggle - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-slate-800/50 border border-slate-600/50 rounded-sm">
            <span className="text-sm text-slate-300 font-mono">LIVE DATA:</span>
            <div className="relative" title={`${liveDataEnabled ? 'Disable' : 'Enable'} live data integration`}>
              <input
                type="checkbox"
                id="live-data-toggle"
                checked={liveDataEnabled}
                onChange={handleLiveDataToggle}
                className="sr-only"
                disabled={!primaryDataBroker}
              />
              <label
                htmlFor="live-data-toggle"
                className={`relative inline-flex items-center h-5 w-9 rounded-full cursor-pointer transition-all duration-200 ${
                  liveDataEnabled
                    ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-500/25'
                    : 'bg-slate-600'
                } ${!primaryDataBroker ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block w-3 h-3 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                    liveDataEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </label>
            </div>
            <Power className={`w-3 h-3 ${liveDataEnabled ? 'text-green-400' : 'text-slate-400'}`} />
          </div>

          {/* Broker Connections - Hidden on mobile */}
          <div className="relative hidden lg:block" ref={dropdownRef}>
            <button
              onClick={() => setShowBrokerDropdown(!showBrokerDropdown)}
              className="flex items-center space-x-1.5 px-2 py-1.5 bg-slate-800/60 border border-slate-600/50 rounded-sm hover:bg-slate-700/60 transition-colors text-xs"
            >
              <LinkIcon className="w-3 h-3 text-green-400" />
              <span className="text-slate-300 font-mono">ACCOUNTS</span>
              {liveAccountsData.total > 0 && (
                <span className="text-green-400 font-mono text-xs">
                  {liveAccountsData.count}/{liveAccountsData.total}
                </span>
              )}
              {/* Data Integration Status - Green when connected */}
              {connectedBrokers.length > 0 ? (
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" title="Data integration active"></div>
              ) : (
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full" title="No data integration"></div>
              )}
            </button>

            {showBrokerDropdown && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-slate-900/90 backdrop-blur-2xl rounded-sm shadow-2xl border border-slate-700/50 z-[90]"
                style={{ backdropFilter: 'blur(32px) saturate(180%)' }}>
                <div className="p-2 border-b border-slate-700/50 bg-slate-800/20 backdrop-blur-sm">
                  <h3 className="text-xs font-semibold text-slate-200 font-mono">CONNECTED BROKERS</h3>
                </div>
                
                <div className="p-1 max-h-48 overflow-y-auto professional-scroll">
                  {connectedBrokers.length > 0 ? (
                    connectedBrokers.map((broker) => (
                      <div key={broker.id} className="flex items-center justify-between p-2 rounded-sm hover:bg-slate-800/50">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-slate-800 rounded-sm flex items-center justify-center">
                            <span className="text-xs">{broker.logo}</span>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-slate-200">{broker.name}</div>
                            <div className="text-xs text-slate-400 font-mono">ID: {broker.clientId}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded-sm font-mono border border-green-700/50">
                            LIVE
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-slate-400 text-sm">No brokers connected</p>
                      <button
                        onClick={() => {
                          setShowBrokerDropdown(false);
                          navigate('/broker');
                        }}
                        className="mt-2 text-xs text-green-400 hover:text-green-300"
                      >
                        Connect a broker
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Alerts Dropdown */}
          <div className="relative" ref={alertsRef}>
            <button 
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="relative p-1.5 rounded-sm hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-slate-300" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium font-mono">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {showAlertsDropdown && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-slate-900/90 backdrop-blur-2xl rounded-sm shadow-2xl border border-slate-700/50 z-[90]"
                style={{ backdropFilter: 'blur(32px) saturate(180%)' }}>
                <div className="p-2 border-b border-slate-700/50 bg-slate-800/20 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-200 font-mono">SYSTEM ALERTS</h3>
                    <button
                      onClick={() => setShowAlertsDropdown(false)}
                      className="p-0.5 rounded-sm hover:bg-slate-800/50"
                    >
                      <X className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto professional-scroll">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`p-2 border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer ${!alert.isRead ? 'bg-slate-800/20' : ''}`}>
                      <div className="flex items-start space-x-2">
                        <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-xs font-medium font-mono ${!alert.isRead ? 'text-slate-200' : 'text-slate-300'}`}>
                              {alert.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-green-400 font-mono">{alert.value}</span>
                              <span className={`text-xs px-1 py-0.5 rounded-sm border font-mono ${getPriorityColor(alert.priority)}`}>
                                {alert.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 font-mono">{alert.message}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-slate-500 font-mono">{alert.time}</span>
                            {!alert.isRead && (
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-2 border-t border-slate-700/50">
                  <button className="w-full text-center text-xs text-green-400 hover:text-green-300 font-medium font-mono">
                    VIEW ALL ALERTS
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages Dropdown */}
          <div className="relative" ref={messagesRef}>
            <button 
              onClick={() => setShowMessagesDropdown(!showMessagesDropdown)}
              className="relative p-1.5 rounded-sm hover:bg-slate-800 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-300" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium font-mono">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {showMessagesDropdown && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-slate-900/90 backdrop-blur-2xl rounded-sm shadow-2xl border border-slate-700/50 z-[90]"
                style={{ backdropFilter: 'blur(32px) saturate(180%)' }}>
                <div className="p-2 border-b border-slate-700/50 bg-slate-800/20 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-200 font-mono">MESSAGES</h3>
                    <button
                      onClick={() => setShowMessagesDropdown(false)}
                      className="p-0.5 rounded-sm hover:bg-slate-800/50"
                    >
                      <X className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto professional-scroll">
                  {messages.map((message) => (
                    <div key={message.id} className={`p-2 border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer ${!message.isRead ? 'bg-slate-800/20' : ''}`}>
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-slate-800 rounded-sm flex items-center justify-center text-xs">
                          {message.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-xs font-medium font-mono ${!message.isRead ? 'text-slate-200' : 'text-slate-300'}`}>
                              {message.from}
                            </h4>
                            <span className="text-xs text-slate-500 font-mono">{message.time}</span>
                          </div>
                          <h5 className={`text-xs ${!message.isRead ? 'font-medium text-slate-200' : 'text-slate-300'} mb-1 font-mono`}>
                            {message.subject}
                          </h5>
                          <p className="text-xs text-slate-400 line-clamp-2">{message.preview}</p>
                          {!message.isRead && (
                            <div className="flex items-center mt-1">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1"></div>
                              <span className="text-xs text-blue-400 font-medium font-mono">NEW</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-2 border-t border-slate-700/50">
                  <button
                    onClick={handleViewAllMessages}
                    className="w-full text-center text-xs text-green-400 hover:text-green-300 font-medium font-mono"
                  >
                    VIEW ALL MESSAGES
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-1.5 p-1.5 rounded-sm hover:bg-slate-800 transition-colors"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-green-600 to-green-500 rounded-sm flex items-center justify-center">
                <span className="text-xs font-bold text-white font-mono">
                  {user?.phone?.slice(-2) || user?.name?.slice(0, 2) || 'TD'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-medium text-slate-200 font-mono">
                  {user?.phone?.slice(-4) || user?.name || 'Trader'}
                </div>
                <div className="text-xs text-green-400 font-mono">PRO</div>
              </div>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-slate-900/90 backdrop-blur-2xl rounded-sm shadow-2xl border border-slate-700/50 z-[90]"
                style={{ backdropFilter: 'blur(32px) saturate(180%)' }}>
                <div className="p-2 border-b border-slate-700/50 bg-slate-800/20 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-500 rounded-sm flex items-center justify-center">
                      <span className="text-xs font-bold text-white font-mono">
                        {user?.phone?.slice(-2) || 'TD'}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-200 font-mono">
                        {user?.phone || 'Professional Trader'}
                      </div>
                      <div className="text-xs text-green-400 font-mono">PREMIUM ACCOUNT</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-1">
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800/50 rounded-sm font-mono"
                  >
                    Account Settings
                  </button>
                  <button className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800/50 rounded-sm font-mono">
                    Trading Preferences
                  </button>
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/broker');
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800/50 rounded-sm font-mono"
                  >
                    Broker Settings
                  </button>
                  <div className="border-t border-slate-700/50 my-1"></div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-2 py-1.5 text-xs text-red-400 hover:bg-red-900/20 rounded-sm font-mono"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;