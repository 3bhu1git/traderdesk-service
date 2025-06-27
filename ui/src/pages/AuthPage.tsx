import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, KeyRound, ArrowRight, Shield, AlertCircle, ArrowLeft, BarChart3, Terminal } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

const AuthPage: React.FC = () => {
  const { login, sendOTP, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [googleSignInAttempted, setGoogleSignInAttempted] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<any>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Initialize Google Sign-In
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: 'your-google-client-id', // Replace with actual client ID
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button') || document.createElement('div'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signup_with',
            shape: 'rectangular',
          }
        );
      }
    };

    document.head.appendChild(script);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // If Google sign-in was attempted and we have user data but need phone verification
  useEffect(() => {
    if (googleSignInAttempted && googleUserData) {
      setStep('phone');
    }
  }, [googleSignInAttempted, googleUserData]);

  const handleGoogleResponse = async (response: any) => {
    try {
      setIsSubmitting(true);
      setError('');

      // Decode the JWT token to get user info
      let userData;
      if (response.credential === 'demo.jwt.token') {
        userData = {
          name: 'Demo User',
          email: 'demo@gmail.com',
          picture: 'https://via.placeholder.com/150'
        };
      } else {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        userData = {
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
        };
      }

      // Store Google user data and prompt for phone verification
      setGoogleUserData(userData);
      setGoogleSignInAttempted(true);
      setStep('phone');
      setError('Please verify your phone number to continue');
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/market" replace />;
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      setIsSubmitting(false);
      return;
    }

    const success = await sendOTP(phone);
    if (success) {
      setStep('otp');
    } else {
      setError('Failed to send OTP. Please try again.');
      console.error('[AuthPage] Send OTP failed');
      // Show browser alert for debugging
      alert('Failed to send OTP. Check console for details.');
    }
    setIsSubmitting(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setIsSubmitting(false);
      return;
    }

    // If Google sign-in was attempted, complete the process with phone verification
    if (googleSignInAttempted && googleUserData) {
      const success = await loginWithGoogle({
        ...googleUserData,
        phone: `+91${phone}`
      });
      
      if (!success) {
        setError('Failed to complete Google sign-in. Please try again.');
      }
    } else {
      // Regular phone login
      const success = await login(phone, otp);
      if (!success) {
        setError('Invalid OTP. Please try again.');
        console.error('[AuthPage] Login failed');
        // Show browser alert for debugging
        alert('Login failed. Check console for details.');
      }
    }
    
    setIsSubmitting(false);
  };

  const handleResendOTP = async () => {
    setError('');
    const success = await sendOTP(phone);
    if (success) {
      setError('');
      // Show success message briefly
      setError('OTP sent successfully!');
      setTimeout(() => setError(''), 3000);
    } else {
      setError('Failed to resend OTP. Please try again.');
    }
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
    <div className="min-h-screen bg-black text-white overflow-hidden relative font-mono">
      {/* Exact Landing Page Background */}
      <div className="fixed inset-0 z-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Gradient Orbs - Exact Landing Page Style */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-indigo-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Mouse Follower - Landing Page Style */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>
      </div>

      {/* Navigation - Landing Page Style */}
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
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-mono">
                TRADERDESK.AI
              </h1>
              <div className="text-xs text-purple-400 font-mono">PROFESSIONAL_TRADING</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-400 hover:text-white transition-colors duration-300 relative group font-mono text-sm"
            >
              BACK_TO_HOME
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 group-hover:w-full transition-all duration-300"></div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content - Moved Much Higher */}
      <div className="relative z-10 pt-16 pb-8 px-6 flex items-start justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Logo and Title - Terminal Style */}
          <div className="text-center mb-6">
            {/* Floating Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm px-4 py-2 mb-4 group hover:bg-white/10 transition-all duration-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-300 font-mono">SECURE_AUTHENTICATION</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-6 leading-tight font-mono">
              <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent animate-gradient">
                ACCESS
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                TERMINAL
              </span>
            </h1>
          </div>

          {/* Auth Card - Terminal Style */}
          <div className="relative">
            {/* Glow Effect - Terminal Style */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-sm blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-sm p-6 border border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 group terminal-glow">
              {/* Return to Base Button - Terminal Style */}
              <Link
                to="/"
                className="absolute top-4 left-4 p-2 text-purple-400 hover:text-purple-300 transition-colors group z-20"
                title="RETURN_TO_BASE"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>

              <div className="relative z-10 mt-6">
                {step === 'phone' ? (
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-sm flex items-center justify-center mx-auto mb-3">
                        <Terminal className="w-7 h-7 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-white mb-2 font-mono">ENTER_PHONE_NUMBER</h2>
                      <p className="text-gray-400 text-xs font-mono">VERIFICATION_CODE_WILL_BE_SENT</p>
                      
                      {/* Show Google user info if available */}
                      {googleUserData && (
                        <div className="mt-2 p-2 bg-purple-900/20 border border-purple-700/30 rounded-sm">
                          <p className="text-purple-400 text-xs">
                            GOOGLE_ACCOUNT: {googleUserData.email}
                          </p>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-xs font-medium mb-2 font-mono">
                          PHONE_NUMBER
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-mono text-sm">
                            +91
                          </span>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="9876543210"
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm font-mono text-sm"
                            maxLength={10}
                            required
                          />
                        </div>
                      </div>

                      {error && (
                        <div className={`text-xs border rounded-sm p-3 flex items-center space-x-2 font-mono ${
                          error.includes('successfully') 
                            ? 'text-green-300 bg-green-500/10 border-green-500/30' 
                            : 'text-red-300 bg-red-500/10 border-red-500/30'
                        }`}>
                          <AlertCircle className="w-4 h-4" />
                          <span>{error.toUpperCase().replace(/ /g, '_')}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting || phone.length !== 10}
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 rounded-sm font-semibold hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden group font-mono text-sm"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>SENDING...</span>
                          </>
                        ) : (
                          <>
                            <span>SEND_OTP</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Google Sign-In - Terminal Style */}
                    {!googleSignInAttempted && (
                      <div className="mt-5">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-transparent text-gray-400 font-mono">OR_CONTINUE_WITH</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div id="google-signin-button" className="w-full"></div>
                          {/* Fallback button if Google SDK doesn't load */}
                          <button
                            onClick={() => handleGoogleResponse({ credential: 'demo.jwt.token' })}
                            className="mt-3 w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 border border-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-xs"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>SIGNING_IN...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span>SIGN_IN_WITH_GOOGLE</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-sm flex items-center justify-center mx-auto mb-3">
                        <KeyRound className="w-7 h-7 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-white mb-2 font-mono">ENTER_VERIFICATION_CODE</h2>
                      <p className="text-gray-400 text-xs font-mono">
                        CODE_SENT_TO_+91_{phone}
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-xs font-medium mb-2 font-mono">
                          6_DIGIT_OTP
                        </label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-sm text-white text-center text-xl tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm font-mono"
                          maxLength={6}
                          required
                        />
                        <p className="text-xs text-gray-400 mt-2 text-center font-mono">
                          FOR_DEMO_USE:_123456_OR_ANY_6_DIGIT_CODE
                        </p>
                      </div>

                      {error && (
                        <div className={`text-xs border rounded-sm p-3 flex items-center space-x-2 font-mono ${
                          error.includes('successfully') 
                            ? 'text-green-300 bg-green-500/10 border-green-500/30' 
                            : 'text-red-300 bg-red-500/10 border-red-500/30'
                        }`}>
                          <AlertCircle className="w-4 h-4" />
                          <span>{error.toUpperCase().replace(/ /g, '_')}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting || otp.length !== 6}
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 rounded-sm font-semibold hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden group font-mono text-sm"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>VERIFYING...</span>
                          </>
                        ) : (
                          <>
                            <span>VERIFY_&_LOGIN</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>

                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={() => setStep('phone')}
                          className="text-gray-400 hover:text-purple-400 text-xs py-2 transition-colors font-mono"
                        >
                          ← CHANGE_PHONE_NUMBER
                        </button>
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          className="text-gray-400 hover:text-purple-400 text-xs py-2 transition-colors font-mono"
                          disabled={isSubmitting}
                        >
                          RESEND_OTP
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security Notice - Terminal Style */}
          <div className="mt-4 text-center text-gray-500 text-xs font-mono">
            <p>🔒 SECURE_SINGLE_DEVICE_AUTHENTICATION</p>
            <p>SESSION_EXPIRES_AFTER_12_HOURS_FOR_SECURITY</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;