import React from 'react';

interface StatusBarProps {
  items: {
    label: string;
    value: string;
    color?: string;
    icon?: React.ReactNode;
    isAnimated?: boolean;
  }[];
  lastUpdated?: Date;
}

// Standardized status bar component for consistent display across pages
const StatusBar: React.FC<StatusBarProps> = ({ items, lastUpdated }) => {
  return (
    <div className="professional-card p-3 border border-slate-700/50">
      <div className="flex items-center justify-between text-sm font-mono">
        <div className="flex items-center space-x-6 overflow-x-auto professional-scroll">
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 whitespace-nowrap">
              {item.isAnimated && (
                <div className={`w-2 h-2 ${item.color || 'bg-green-400'} rounded-full animate-pulse`}></div>
              )}
              {item.icon}
              <span className="text-slate-400">{item.label}: </span>
              <span className={item.color || 'text-green-400'}>{item.value}</span>
            </div>
          ))}
        </div>
        {lastUpdated && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-slate-400">Last Update: </span>
            <span className="text-green-400">{lastUpdated.toLocaleTimeString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusBar;