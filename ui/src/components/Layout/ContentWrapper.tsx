import React from 'react';

interface ContentWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

// Standardized content wrapper component to ensure consistent padding and layout
const ContentWrapper: React.FC<ContentWrapperProps> = ({ 
  children, 
  title, 
  description, 
  actions 
}) => {
  return (
    <div className="h-full flex flex-col space-y-4 p-4 md:p-6">
      {/* Header with title, description and actions */}
      {(title || actions) && (
        <div className="flex items-center justify-between">
          {title && (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-200 font-mono">{title}</h1>
              {description && (
                <p className="text-slate-400 text-base md:text-lg mt-1 font-mono">{description}</p>
              )}
            </div>
          )}
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto professional-scroll">
        {children}
      </div>
    </div>
  );
};

export default ContentWrapper;