import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.phone, formData.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      const { data } = await api.post('/auth/google', {
        credential: credentialResponse.credential,
      });

      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      updateUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed.');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ email: '', phone: '', password: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-12">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/umbrellalogo.png" alt="RainShield" className="w-14 h-14 rounded-xl mx-auto mb-4 shadow-soft object-contain" />
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-surface-500 text-sm mt-1">
            {isLogin ? 'Sign in to continue to RainShield' : 'Get started with RainShield'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {!isLogin && (
            <div className="animate-fade-in">
              <label className="block text-xs font-medium text-surface-500 mb-1.5 ml-1">Phone</label>
              <input
                type="tel"
                className="input-field"
                placeholder="Your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1.5 ml-1">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary btn-full btn-lg mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner !w-4 !h-4 !border-2 !border-white/30 !border-t-white" />
                Please wait...
              </span>
            ) : (
              isLogin ? 'Sign in' : 'Create account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-surface-200" />
          <span className="text-xs text-surface-400 font-medium">or continue with</span>
          <div className="flex-1 h-px bg-surface-200" />
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed. Please try again.')}
            useOneTap
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="340"
          />
        </div>

        {/* Toggle */}
        <p className="text-center text-sm text-surface-500 mt-6">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={toggleMode}
            className="text-brand-600 font-medium hover:text-brand-700 transition-colors"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
