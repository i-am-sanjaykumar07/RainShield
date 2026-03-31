import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const MERCHANT_EMAILS = ['palisettysanjaykumar@gmail.com'];

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { path: '/umbrellas', label: 'Umbrellas', icon: '☂' },
  { path: '/tracking', label: 'Tracking', icon: '◎' },
  { path: '/profile', label: 'Profile', icon: '○' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMerchant = MERCHANT_EMAILS.includes(user?.email);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;


  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-surface-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/umbrellalogo.png" alt="RainShield" className="w-8 h-8 rounded-lg object-contain" />
            <span className="text-lg font-bold text-surface-900 hidden sm:block">
              RainShield
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.path)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-surface-500 hover:text-surface-800 hover:bg-surface-100'
                  }`}
              >
                {link.label}
              </button>
            ))}
            {isMerchant && (
              <button
                onClick={() => navigate('/admin')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/admin')
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-amber-600 hover:bg-amber-50'
                }`}
              >
                ⚙ Admin
              </button>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="hidden md:block text-sm text-surface-400 hover:text-surface-600 transition-colors"
            >
              Sign out
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1"
            >
              <span className={`w-5 h-0.5 bg-surface-600 transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
              <span className={`w-5 h-0.5 bg-surface-600 transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-[3px]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-surface-100 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => { navigate(link.path); setMobileOpen(false); }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-all duration-200 ${isActive(link.path)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-surface-600 hover:bg-surface-100'
                    }`}
                >
                  <span className="mr-2 text-surface-400">{link.icon}</span>
                  {link.label}
                </button>
              ))}
              {isMerchant && (
                <button
                  onClick={() => { navigate('/admin'); setMobileOpen(false); }}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-left text-amber-700 hover:bg-amber-50 transition-all"
                >
                  <span className="mr-2">⚙</span>Admin Panel
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 text-left hover:bg-red-50 transition-all"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
