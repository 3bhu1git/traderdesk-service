import React from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// Standardized tab navigation component for consistent display across pages
const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="professional-card p-2 border border-slate-700/50">
      <div className="flex space-x-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-sm font-medium transition-all duration-200 text-sm font-mono whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-green-600/20 to-green-500/20 text-green-300 border border-green-600/30'
                : 'text-slate-400 hover:text-green-300 hover:bg-slate-800/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;