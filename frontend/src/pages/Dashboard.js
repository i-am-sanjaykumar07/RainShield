import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeRentals, setActiveRentals] = useState([]);
  const [rentalHistory, setRentalHistory] = useState([]);

  const fetchActiveRentals = useCallback(async () => {
    try {
      const response = await api.get('/rentals/active');
      setActiveRentals(Array.isArray(response.data) ? response.data : [response.data].filter(Boolean));
    } catch {
      // No active rentals
    }
  }, []);

  const fetchRentalHistory = useCallback(async () => {
    try {
      const response = await api.get('/rentals/history');
      setRentalHistory(response.data);
    } catch {
      // Failed to fetch
    }
  }, []);

  useEffect(() => {
    fetchActiveRentals();
    fetchRentalHistory();
  }, [fetchActiveRentals, fetchRentalHistory]);

  // Removal: const needsDeposit = !user?.depositMade;

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        {/* Header */}
        <div className="mb-6">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.email?.split('@')[0] || 'there'}</p>
        </div>

        {/* Removal: needsDeposit banner */}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Removal: Wallet Card */}

          {/* Active Rentals */}
          <div className="card-interactive" onClick={() => navigate('/tracking')}>
            <p className="section-label mb-2">Active Rentals</p>
            <p className="stat-value text-surface-900">
              {activeRentals.length}
            </p>
            <p className="text-xs text-surface-400 mt-2">
              {activeRentals.length > 0 ? 'Tap to track →' : 'No active rentals'}
            </p>
          </div>

          {/* Total Rentals */}
          <div className="card">
            <p className="section-label mb-2">Total Rentals</p>
            <p className="stat-value text-surface-900">
              {rentalHistory.length}
            </p>
            <p className="text-xs text-surface-400 mt-2">All-time usage</p>
          </div>

          {/* Status */}
          <div className="card">
            <p className="section-label mb-2">Account Status</p>
            <div className="mt-1">
              <span className="badge badge-success">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="section-title mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/umbrellas')}
                className="btn-success btn-full justify-start"
              >
                <span>☂</span> Browse Umbrellas
              </button>
              <button
                onClick={() => navigate('/tracking')}
                className="btn-secondary btn-full justify-start"
              >
                <span>◎</span> Track Rentals
              </button>
            </div>
          </div>

          {/* Pricing */}
          <div className="card">
            <h3 className="section-title mb-4">Pricing</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-surface-100">
                <span className="text-sm text-surface-600">Hourly Rate</span>
                <span className="font-mono font-semibold text-surface-900">₹7/hr</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-surface-100">
                <span className="text-sm text-surface-600">Daily Cap</span>
                <span className="font-mono font-semibold text-surface-900">₹70/day</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-surface-600">Minimum Charge</span>
                <span className="font-mono font-semibold text-surface-900">₹7</span>
              </div>
            </div>
          </div>

          {/* Recent History */}
          <div className="card">
            <h3 className="section-title mb-4">Recent History</h3>
            {rentalHistory.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-surface-400 text-sm">No rental history yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rentalHistory.slice(0, 5).map((rental) => (
                  <div
                    key={rental._id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-surface-50 hover:bg-surface-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-surface-800">
                        {rental.umbrella?.umbrellaId || 'Unknown'}
                      </p>
                      <p className="text-xs text-surface-400">
                        {new Date(rental.startTime).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-surface-800">
                        ₹{rental.totalAmount}
                      </p>
                      <p className="text-xs text-surface-400">{rental.duration}h</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
