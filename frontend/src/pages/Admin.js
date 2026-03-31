import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

// ─── Hardcoded merchant email — only this user sees the admin page ────────────
const MERCHANT_EMAIL = 'sanjay@cu.edu.in'; // ← change to your actual admin email

const Admin = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState({ type: '', text: '' });

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title">Merchant Admin</h1>
            <p className="page-subtitle">Platform overview and management</p>
          </div>
        </div>

        {/* Placeholder */}
        <div className="card text-center py-16">
          <p className="text-3xl mb-3">🛠️</p>
          <h2 className="text-lg font-semibold text-surface-800 mb-1">Merchant Dashboard</h2>
          <p className="text-sm text-surface-400">Withdrawal management has been removed as per the new direct payment system.</p>
          <p className="text-sm text-surface-400 mt-2">Rental and transaction analytics coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
