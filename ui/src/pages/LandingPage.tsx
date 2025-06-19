import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Shield, Users, Star, ArrowRight, CheckCircle, Mail, User, CreditCard, Sparkles, Zap, Target, Crown } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import { NSEDataService } from '../services/nseDataService';

declare global {
  interface Window {
    google: any;
  }
}

const LandingPage: React.FC = () => {
  const { announcements } = useAdmin();
  const { loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [marketData, setMarketData] = useState({
    nifty: { value: 19745.30, change: 165.85, changePercent: 0.86 },
    sensex: { value: 65721.25, change: 425.60, changePercent: 0.65 },
    bankNifty: { value: 44235.80, change: 285.45, changePercent: 0.65 }
  });
  const [topGainers, setTopGainers] = useState<any[]>([]);
  const [topLosers, setTopLosers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Load Google Sign-In API
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);

    // Fetch real market data
    fetchMarketData();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [marketDataResult, topGainersResult, topLosersResult] = await Promise.all([
        NSEDataService.getMarketData(),
        NSEDataService.getTopGainers(3),
        NSEDataService.getTopLosers(3)
      ]);
      
      setMarketData({
        nifty: marketDataResult.nifty,
        sensex: marketDataResult.sensex,
        bankNifty: marketDataResult.bankNifty
      });
      
      setTopGainers(topGainersResult);
      setTopLosers(topLosersResult);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: 'your-google-client-id', // Replace with actual client ID
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    }
  };

  const handleGoogleResponse = async (response: any) => {
    try {
      setIsSubmitting(true);

      // For demo purposes, create mock user data
      let userData;
      if (response.credential === 'demo.jwt.token') {
        userData = {
          name: 'Demo User',
          email: 'demo@gmail.com',
          picture: 'https://via.placeholder.com/150'
        };
      } else {
        // Decode the JWT token to get user info
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        userData = {
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
        };
      }

      const success = await loginWithGoogle(userData);
      if (success) {
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        alert('Google sign-in failed. Please try again.');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert('Google sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form data
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call for subscription
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    setFormData({ name: '', email: '' });
  };

  const handleGoogleSignIn = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      // Fallback for demo
      handleGoogleResponse({ credential: 'demo.jwt.token' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-indigo-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Mouse Follower */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 fixed w-full top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                TraderDesk.ai
              </h1>
              <div className="text-xs text-purple-400">Professional Trading</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/admin"
              className="text-gray-400 hover:text-white transition-colors duration-300 relative group"
            >
              Admin
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              to="/auth"
              className="relative group bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Login</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Floating Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-8 group hover:bg-white/10 transition-all duration-300">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-sm text-gray-300">AI-Powered Trading Platform</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent animate-gradient">
                Engineered for
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                Disciplined
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Power your desk with <span className="text-purple-400 font-semibold">institutional-grade setup</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a 
                href="#signup" 
                className="group relative bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center space-x-2">
                  <span>Start Trading Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </a>
            </div>
          </div>

          {/* Live Market Data Dashboard */}
          <div className="relative max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-400">Live Market Data</div>
                </div>

                {/* Live Market Data */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* NIFTY 50 */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-400">NIFTY 50</span>
                      <span className={`text-sm font-semibold ${marketData.nifty.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {marketData.nifty.change >= 0 ? '+' : ''}{marketData.nifty.changePercent}%
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">{marketData.nifty.value.toLocaleString()}</div>
                    <div className={`text-sm ${marketData.nifty.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {marketData.nifty.change >= 0 ? '+' : ''}{marketData.nifty.change}
                    </div>
                    <div className="h-16 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg flex items-end justify-between p-2 mt-4">
                      {[...Array(8)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`rounded-sm animate-pulse ${marketData.nifty.change >= 0 ? 'bg-gradient-to-t from-green-500 to-green-400' : 'bg-gradient-to-t from-red-500 to-red-400'}`}
                          style={{ 
                            height: `${Math.random() * 100 + 20}%`,
                            width: '8px',
                            animationDelay: `${i * 0.1}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* BANK NIFTY */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-400">BANK NIFTY</span>
                      <span className={`text-sm font-semibold ${marketData.bankNifty.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {marketData.bankNifty.change >= 0 ? '+' : ''}{marketData.bankNifty.changePercent}%
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">{marketData.bankNifty.value.toLocaleString()}</div>
                    <div className={`text-sm ${marketData.bankNifty.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {marketData.bankNifty.change >= 0 ? '+' : ''}{marketData.bankNifty.change}
                    </div>
                    <div className="h-16 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg flex items-end justify-between p-2 mt-4">
                      {[...Array(8)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`rounded-sm animate-pulse ${marketData.bankNifty.change >= 0 ? 'bg-gradient-to-t from-green-500 to-green-400' : 'bg-gradient-to-t from-red-500 to-red-400'}`}
                          style={{ 
                            height: `${Math.random() * 100 + 20}%`,
                            width: '8px',
                            animationDelay: `${i * 0.1}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Top Movers */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center space-x-2 mb-4">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-400">Top Movers</span>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Top Gainers */}
                        <div>
                          <div className="text-xs text-green-400 mb-1">TOP GAINERS</div>
                          {topGainers.slice(0, 2).map((stock, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">{stock.symbol}</span>
                              <span className="text-green-400">+{stock.changePercent}%</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Top Losers */}
                        <div>
                          <div className="text-xs text-red-400 mb-1">TOP LOSERS</div>
                          {topLosers.slice(0, 2).map((stock, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">{stock.symbol}</span>
                              <span className="text-red-400">{stock.changePercent}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Feed */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400 font-medium">Live Trading Results</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Real <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Profits</span> from Real Traders
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See how our community is consistently profiting with our AI-powered recommendations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.slice(0, 6).map((announcement, index) => (
              <div 
                key={announcement.id} 
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center relative">
                      <span className="text-white font-semibold text-sm">
                        {announcement.userName.split(' ').map(n => n[0]).join('')}
                      </span>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black"></div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{announcement.userName}</div>
                      <div className="text-sm text-gray-400">{announcement.stockSymbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold text-lg">+₹{announcement.profit.toLocaleString()}</div>
                    <div className="text-sm text-green-400">+{announcement.percentage}%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {announcement.date.toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Verified</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need to <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Dominate</span> the Markets
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Professional-grade tools powered by AI and used by thousands of successful traders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: 'AI-Powered Screeners',
                description: 'Advanced screening algorithms that identify high-probability trading opportunities across all market segments',
                gradient: 'from-purple-500 to-indigo-500',
                features: ['Long-term Investment Picks', 'IPO Analysis', 'F&O Opportunities']
              },
              {
                icon: TrendingUp,
                title: 'Premium Indicators',
                description: 'Institutional-grade technical indicators with machine learning optimization for maximum accuracy',
                gradient: 'from-green-500 to-emerald-500',
                features: ['Magic Levels', 'MTF Analysis', 'Smart Money Flow']
              },
              {
                icon: Shield,
                title: 'Real-time Trading Desk',
                description: 'Professional trading interface with live data, option chain analysis, and volatility monitoring',
                gradient: 'from-blue-500 to-cyan-500',
                features: ['Live Charts', 'Option Chain', 'VIX Analysis']
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105"
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-white mb-4 text-center">{feature.title}</h3>
                  <p className="text-gray-400 mb-6 text-center leading-relaxed">{feature.description}</p>
                  
                  <div className="space-y-3">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className={`w-2 h-2 bg-gradient-to-r ${feature.gradient} rounded-full`}></div>
                        <span className="text-gray-300 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Section */}
      <section id="signup" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 p-12">
              <div className="text-white">
                <div className="inline-flex items-center space-x-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-8">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300 font-medium">Premium Access</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                  Start Your <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Trading Journey</span>
                </h2>
                
                <div className="space-y-6 mb-8">
                  {[
                    '4 months premium access',
                    'All premium features included',
                    '24/7 WhatsApp support',
                    'Video tutorials & training',
                    'Real-time market alerts',
                    'AI-powered recommendations'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-4 group">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-300 group-hover:text-white transition-colors duration-300">{benefit}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mb-6">
                  <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">₹7,260</div>
                  <div className="text-purple-300 text-lg">for 4 months (₹1,815/month)</div>
                  <div className="text-sm text-gray-400 mt-2">Save 40% compared to monthly billing</div>
                </div>
              </div>

              <div className="relative">
                {showSuccess ? (
                  <div className="text-center text-white bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Registration Successful!</h3>
                    <p className="text-gray-300 mb-6">Check your email for payment instructions</p>
                    <button
                      onClick={() => setShowSuccess(false)}
                      className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-cyan-700 transition-all duration-200"
                    >
                      Register Another User
                    </button>
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">Join TraderDesk.ai</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Full Name
                        </label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300" />
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Enter your full name"
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm transition-all duration-300"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="Enter your email"
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm transition-all duration-300"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            <span>Subscribe Now - ₹7,260</span>
                          </>
                        )}
                      </button>
                    </form>

                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
                        </div>
                      </div>

                      <button
                        onClick={handleGoogleSignIn}
                        disabled={isSubmitting}
                        className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 border border-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Signing in...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span>Sign up with Google</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/50 backdrop-blur-sm border-t border-white/10 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">TraderDesk.ai</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">Professional trading tools powered by artificial intelligence for serious traders and investors.</p>
            </div>
            
            {[
              {
                title: 'Features',
                links: ['Stock Screeners', 'Premium Indicators', 'Trading Desk', 'Video Tutorials']
              },
              {
                title: 'Support',
                links: ['WhatsApp Support', 'Email Support', 'Video Tutorials', 'FAQ']
              },
              {
                title: 'Contact',
                links: ['support@traderdesk.ai', '+91 98765 43210', 'Mumbai, India']
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold text-white mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, idx) => (
                    <li key={idx}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 relative group">
                        {link}
                        <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 group-hover:w-full transition-all duration-300"></div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 TraderDesk.ai. All rights reserved. Built with ❤️ for traders.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;