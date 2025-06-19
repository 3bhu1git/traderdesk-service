import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Collapsed by default

  useEffect(() => {
    // Create TradingView chart for background
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          width: '100%',
          height: '100%',
          symbol: 'NSE:NIFTY',
          interval: '1',
          timezone: 'Asia/Kolkata',
          theme: 'dark',
          style: '3', // Area chart
          locale: 'en',
          toolbar_bg: 'transparent',
          enable_publishing: false,
          hide_top_toolbar: true,
          hide_legend: true,
          save_image: false,
          container_id: 'background-chart',
          hide_side_toolbar: true,
          details: false,
          hotlist: false,
          calendar: false,
          studies: [],
          overrides: {
            'paneProperties.background': 'transparent',
            'paneProperties.backgroundType': 'solid',
            'mainSeriesProperties.areaStyle.color1': 'rgba(0, 255, 65, 0.05)',
            'mainSeriesProperties.areaStyle.color2': 'rgba(0, 255, 65, 0.01)',
            'mainSeriesProperties.areaStyle.linecolor': 'rgba(0, 255, 65, 0.1)',
            'mainSeriesProperties.areaStyle.linewidth': 1,
            'scalesProperties.textColor': 'rgba(0, 255, 65, 0.2)',
            'scalesProperties.lineColor': 'rgba(0, 255, 65, 0.05)',
          }
        });
      }
    };
    
    if (!document.querySelector('script[src="https://s3.tradingview.com/tv.js"]')) {
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Professional Background */}
      <div className="fixed inset-0 z-0">
        {/* Chart Container */}
        <div 
          id="background-chart" 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ 
            filter: 'blur(0.5px)',
            transform: 'scale(1.02)',
          }}
        />
        
        {/* Professional Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-slate-950/95"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/98 via-slate-900/60 to-slate-950/90"></div>
        
        {/* Subtle animated elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-500/5 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-slate-500/5 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Fixed Header */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content Area with proper padding */}
      <div className={`relative z-10 transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-72' : 'lg:ml-16'
      }`}>
        <main className="h-[calc(100vh-3.5rem)] overflow-y-auto professional-scroll">
          <div className="w-full h-full p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;