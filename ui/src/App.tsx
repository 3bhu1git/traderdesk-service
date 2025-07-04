import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { AdminProvider } from './context/AdminContext';
import { TradeProvider } from './context/TradeContext';
import { NotificationProvider, NotificationContainer } from './context/NotificationContext';
import Layout from './components/Layout/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ProfileGuard from './components/common/ProfileGuard';
import LoadingScreen from './components/common/LoadingScreen';
import NotFound from './pages/NotFound';

// Lazy load route components for code splitting
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TradingDesk = lazy(() => import('./pages/TradingDesk'));
const Screener = lazy(() => import('./pages/Screener'));
const Indicators = lazy(() => import('./pages/Indicators'));
const Tutorials = lazy(() => import('./pages/Tutorials'));
const Subscription = lazy(() => import('./pages/Subscription'));
const Profile = lazy(() => import('./pages/Profile'));
const Performance = lazy(() => import('./pages/Performance'));
const Broker = lazy(() => import('./pages/Broker'));
const Chat = lazy(() => import('./pages/Chat'));
const Market = lazy(() => import('./pages/Market'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          <AdminProvider>
            <TradeProvider>
              <NotificationProvider>
                <div className="min-h-screen bg-white">
                  <NotificationContainer />
                  <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={<Navigate to="/market" replace />} />
                  <Route path="/trading-desk" element={
                    <ProtectedRoute>
                      <ProfileGuard>
                        <Layout>
                          <Suspense fallback={<LoadingScreen />}>
                            <TradingDesk />
                          </Suspense>
                        </Layout>
                      </ProfileGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/screener" element={
                    <ProtectedRoute>
                      <ProfileGuard>
                        <Layout>
                          <Suspense fallback={<LoadingScreen />}>
                            <Screener />
                          </Suspense>
                        </Layout>
                      </ProfileGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/indicators" element={
                    <ProtectedRoute>
                      <ProfileGuard>
                        <Layout>
                          <Suspense fallback={<LoadingScreen />}>
                            <Indicators />
                          </Suspense>
                        </Layout>
                      </ProfileGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/tutorials" element={
                    <ProtectedRoute>
                      <ProfileGuard>
                        <Layout>
                          <Suspense fallback={<LoadingScreen />}>
                            <Tutorials />
                          </Suspense>
                        </Layout>
                      </ProfileGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/subscription" element={
                    <ProtectedRoute>
                      <ProfileGuard>
                        <Layout>
                          <Suspense fallback={<LoadingScreen />}>
                            <Subscription />
                          </Suspense>
                        </Layout>
                      </ProfileGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingScreen />}>
                          <Profile />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/performance" element={
                    <ProtectedRoute>
                      <ProfileGuard>
                        <Layout>
                          <Suspense fallback={<LoadingScreen />}>
                            <Performance />
                          </Suspense>
                        </Layout>
                      </ProfileGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/broker" element={
                    <ProtectedRoute>
                      <ProfileGuard>
                        <Layout>
                          <Suspense fallback={<LoadingScreen />}>
                            <Broker />
                          </Suspense>
                        </Layout>
                      </ProfileGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <ProfileGuard>
                        <Layout>
                          <Suspense fallback={<LoadingScreen />}>
                            <Chat />
                          </Suspense>
                        </Layout>
                      </ProfileGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/market" element={
                    <ProtectedRoute>
                      <ProfileGuard>
                        <Layout>
                          <Suspense fallback={<LoadingScreen />}>
                            <Market />
                          </Suspense>
                        </Layout>
                      </ProfileGuard>
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </NotificationProvider>
            </TradeProvider>
          </AdminProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;