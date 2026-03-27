import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import SplashScreen from './components/SplashScreen';
import loadGoogleMapsAPI from './utils/loadGoogleMaps';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UmbrellaSelection from './pages/UmbrellaSelection';
import Wallet from './pages/Wallet';
import RentalTracking from './pages/RentalTracking';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './services/AuthContext';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    
    // Load Google Maps API
    loadGoogleMapsAPI()
      .then(() => setMapsLoaded(true))
      .catch((err) => console.error('Google Maps loading error:', err));
    
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <GoogleOAuthProvider clientId="21304674043-kbma8ap3md5n46a61m4sgo0d28dlkmlu.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/umbrellas" element={<ProtectedRoute><UmbrellaSelection /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
              <Route path="/tracking" element={<ProtectedRoute><RentalTracking /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
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

export default App;