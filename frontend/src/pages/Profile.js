import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: '', phone: '', currentPassword: '', newPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = { email: formData.email, phone: formData.phone };
      if (formData.newPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await api.put('/auth/profile', updateData);
      updateUser(response.data.user);
      setEditing(false);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await api.delete('/auth/profile');
      logout();
      navigate('/login');
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete account.' });
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account</p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`card mb-4 animate-fade-in ${
            message.type === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
          }`}>
            <p className={`text-sm ${message.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-surface-900 truncate">
                {user?.email?.split('@')[0]}
              </h2>
              <p className="text-sm text-surface-500 truncate">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="badge-neutral">
                  {user?.googleId ? 'Google Account' : 'Email Account'}
                </span>
                {user?.createdAt && (
                  <span className="badge-neutral">
                    Since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Info — 2 cols */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Account Details</h3>
                {!editing && (
                  <button onClick={() => setEditing(true)} className="btn-ghost text-sm">
                    Edit
                  </button>
                )}
              </div>

              {!editing ? (
                <div className="space-y-3">
                  {[
                    { label: 'Email', value: user?.email || 'Not provided' },
                    { label: 'Phone', value: user?.phone || 'Not provided' },
                    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : 'Unknown' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-surface-100 last:border-0">
                      <span className="text-sm text-surface-500">{label}</span>
                      <span className="text-sm font-medium text-surface-800">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-surface-500 mb-1.5">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-500 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      className="input-field"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  {!user?.googleId && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-surface-500 mb-1.5">Current Password</label>
                        <input
                          type="password"
                          className="input-field"
                          placeholder="Required to change password"
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-surface-500 mb-1.5">New Password</label>
                        <input
                          type="password"
                          className="input-field"
                          placeholder="Leave blank to keep current"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Activity */}
            <div className="card">
              <p className="section-label mb-2">Total Rentals</p>
              <p className="stat-value text-surface-900 mb-3">{user?.rentalHistory?.length || 0}</p>
              <button onClick={() => navigate('/dashboard')} className="btn-secondary btn-full text-sm">
                View History
              </button>
            </div>

            {/* Danger */}
            <div className="card border-red-200">
              <p className="text-sm font-semibold text-red-800 mb-2">Danger Zone</p>
              <p className="text-xs text-red-600 mb-3">
                Deleting your account is permanent and cannot be undone.
              </p>
              <button onClick={handleDeleteAccount} className="btn-danger btn-full text-sm">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
