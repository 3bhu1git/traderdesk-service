import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Filter, 
  TrendingUp, 
  PlayCircle, 
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Target,
  Link as LinkIcon,
  Activity,
  MessageSquare,
  Building2
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/market', icon: Building2, label: 'Market Intelligence' },
    { path: '/trading-desk', icon: BarChart3, label: 'Trading Desk' },
    { path: '/screener', icon: Filter, label: 'Screener' },
    { path: '/indicators', icon: TrendingUp, label: 'Indicators' },
    { path: '/performance', icon: Target, label: 'Performance' },
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/tutorials', icon: PlayCircle, label: 'Tutorials' },
    { path: '/broker', icon: LinkIcon, label: 'Brokers' },
    { path: '/subscription', icon: CreditCard, label: 'Subscription' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Mobile Sidebar - Full screen overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Background overlay */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onToggle}></div>
          
          {/* Sidebar content - positioned below header */}
          <div className="absolute left-0 top-14 bottom-0 w-72 bg-slate-900/98 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl">
            <div className="relative z-10 flex flex-col h-full">
              {/* Mobile Logo */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700/50 min-h-[56px]">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-500 rounded-sm flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-slate-200 font-mono">
                      TRADERDESK
                    </h1>
                    <div className="text-xs text-green-400 font-mono">PRO</div>
                  </div>
                </div>
                
                <button
                  onClick={onToggle}
                  className="p-1.5 rounded-sm hover:bg-slate-800 transition-colors flex-shrink-0"
                >
                  <ChevronLeft className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 p-3 space-y-2 overflow-y-auto professional-scroll">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => onToggle()}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-sm transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-green-600/20 to-green-500/20 text-green-300 border border-green-600/30'
                          : 'hover:bg-slate-800/50 text-slate-300 hover:text-green-300 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-green-400' : 'text-slate-400 group-hover:text-green-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-base font-mono ${isActive ? 'text-green-300' : 'text-slate-300 group-hover:text-green-300'}`}>
                          {item.label.toUpperCase()}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Status Panel */}
              <div className="p-3 border-t border-slate-700/50">
                <div className="bg-slate-800/50 rounded-sm p-3 border border-slate-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-semibold text-green-400 font-mono">STATUS</span>
                  </div>
                  <div className="space-y-1.5 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Data:</span>
                      <span className="text-green-400">LIVE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Latency:</span>
                      <span className="text-green-400">12ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-slate-900/98 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 z-40 group hidden lg:block ${
        isOpen ? 'w-72' : 'w-16 hover:w-72'
      }`}>
        <div className="relative z-10 flex flex-col h-full">
          {/* Desktop Logo Header */}
          <div className="border-b border-slate-700/50 min-h-[56px] flex items-center justify-center relative">
            {/* Collapsed state - centered logo */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 group-hover:opacity-0 group-hover:pointer-events-none'
            }`}>
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-500 rounded-sm flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
            </div>
            
            {/* Expanded state - full logo with toggle */}
            <div className={`absolute inset-0 flex items-center justify-between px-4 transition-all duration-300 ${
              isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
            }`}>
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-500 rounded-sm flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-200 font-mono">
                    TRADERDESK
                  </h1>
                  <div className="text-xs text-green-400 font-mono">PRO</div>
                </div>
              </div>
              
              <button
                onClick={onToggle}
                className="p-1.5 rounded-sm hover:bg-slate-800 transition-colors flex-shrink-0"
              >
                {isOpen ? (
                  <ChevronLeft className="w-3 h-3 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 p-3 space-y-2 overflow-y-auto professional-scroll">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <div key={item.path} className="relative">
                  <Link
                    to={item.path}
                    className={`flex items-center transition-all duration-200 group/item ${
                      isActive
                        ? 'bg-gradient-to-r from-green-600/20 to-green-500/20 text-green-300 border border-green-600/30'
                        : 'hover:bg-slate-800/50 text-slate-300 hover:text-green-300 border border-transparent'
                    } ${
                      isOpen 
                        ? 'px-4 py-3 rounded-sm' 
                        : 'w-10 h-10 mx-auto rounded-sm justify-center group-hover:w-full group-hover:mx-0 group-hover:px-4 group-hover:justify-start group-hover:py-3'
                    }`}
                    title={!isOpen ? item.label : undefined}
                  >
                    {/* Icon container - perfectly centered when collapsed */}
                    <div className={`flex items-center justify-center ${
                      isOpen 
                        ? 'w-5 h-5' 
                        : 'w-10 h-10 group-hover:w-5 group-hover:h-5'
                    }`}>
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-green-400' : 'text-slate-400 group-hover/item:text-green-400'}`} />
                    </div>
                    
                    {/* Text content - hidden when collapsed */}
                    <div className={`flex-1 min-w-0 transition-all duration-300 ${
                      isOpen 
                        ? 'ml-3 opacity-100 translate-x-0' 
                        : 'ml-0 opacity-0 translate-x-2 group-hover:ml-3 group-hover:opacity-100 group-hover:translate-x-0'
                    }`}>
                      <div className={`font-medium text-base font-mono ${
                        isActive ? 'text-green-300' : 'text-slate-300 group-hover/item:text-green-300'
                      }`}>
                        {item.label.toUpperCase()}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Desktop Status Panel */}
          <div className={`p-3 border-t border-slate-700/50 transition-all duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <div className="bg-slate-800/50 rounded-sm p-3 border border-slate-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400 font-mono">STATUS</span>
              </div>
              <div className="space-y-1.5 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Data:</span>
                  <span className="text-green-400">LIVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trading:</span>
                  <span className="text-green-400">ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Latency:</span>
                  <span className="text-green-400">12ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Uptime:</span>
                  <span className="text-green-400">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;