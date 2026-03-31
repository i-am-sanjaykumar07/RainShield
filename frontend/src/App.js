import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import SplashScreen from './components/SplashScreen';
import loadGoogleMapsAPI from './utils/loadGoogleMaps';
import { AuthProvider, useAuth } from './services/AuthContext';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UmbrellaSelection = lazy(() => import('./pages/UmbrellaSelection'));
const RentalTracking = lazy(() => import('./pages/RentalTracking'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));

function App() {
  useEffect(() => {
    // Load Google Maps API
    loadGoogleMapsAPI()
      .catch((err) => console.error('Google Maps loading error:', err));
  }, []);

  return (
    <GoogleOAuthProvider clientId="21304674043-kbma8ap3md5n46a61m4sgo0d28dlkmlu.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          <div className="App">
            <Suspense fallback={<SplashScreen />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/umbrellas" element={<ProtectedRoute><UmbrellaSelection /></ProtectedRoute>} />
                <Route path="/tracking" element={<ProtectedRoute><RentalTracking /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin" element={<MerchantRoute><Admin /></MerchantRoute>} />
                <Route path="/" element={<Navigate to="/login" />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

// Admin route protection
function MerchantRoute({ children }) {
  const { user } = useAuth();
  const adminEmails = (process.env.REACT_APP_ADMIN_EMAILS || 'palisettysanjaykumar@gmail.com,sanjay@cu.edu.in').split(',');
  
  if (!user) return <Navigate to="/login" />;
  if (!adminEmails.includes(user.email)) return <Navigate to="/dashboard" />;
  
  return children;
}

export default App;