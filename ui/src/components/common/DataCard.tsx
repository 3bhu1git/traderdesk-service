import React from 'react';

interface DataCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  changePercent?: string | number;
  icon?: React.ReactNode;
  isLoading?: boolean;
  isPositive?: boolean;
  additionalInfo?: string;
  onClick?: () => void;
}

// Standardized data card component for consistent display across pages
const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  change,
  changePercent,
  icon,
  isLoading,
  isPositive,
  additionalInfo,
  onClick
}) => {
  return (
    <div 
      className={`professional-card p-4 border border-slate-700/50 ${onClick ? 'cursor-pointer hover:border-green-500/50 transition-all duration-200' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-xs text-slate-400 font-mono">{title}</span>
        </div>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-3/4 mb-1"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <div className="text-xl font-bold text-slate-200 font-mono mb-1">
            {value}
          </div>
          {(change !== undefined || changePercent !== undefined) && (
            <div className={`text-sm font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {change !== undefined && (
                <span>{isPositive ? '+' : ''}{change} </span>
              )}
              {changePercent !== undefined && (
                <span>({isPositive ? '+' : ''}{changePercent}%)</span>
              )}
            </div>
          )}
          {additionalInfo && (
            <div className="text-xs text-slate-500 font-mono mt-1">{additionalInfo}</div>
          )}
        </>
      )}
    </div>
  );
};

export default DataCard;