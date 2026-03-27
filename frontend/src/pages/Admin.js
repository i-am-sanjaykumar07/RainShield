import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

// ─── Hardcoded merchant email — only this user sees the admin page ────────────
const MERCHANT_EMAIL = 'sanjay@cu.edu.in'; // ← change to your actual admin email

const Admin = () => {
  const navigate = useNavigate();
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of tx being actioned
  const [noteInputs, setNoteInputs] = useState({}); // { [txId]: 'UTR...' }
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchPending = useCallback(async () => {
    try {
      const res = await api.get('/wallet/withdrawals/pending');
      setPendingWithdrawals(res.data);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load pending withdrawals.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleComplete = async (tx) => {
    setActionLoading(tx._id);
    try {
      await api.post(`/wallet/withdrawals/${tx._id}/complete`, {
        note: noteInputs[tx._id] || ''
      });
      setPendingWithdrawals(prev => prev.filter(t => t._id !== tx._id));
      setMessage({ type: 'success', text: `✅ Withdrawal for ${tx.user?.email} marked as paid.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Action failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (tx) => {
    if (!window.confirm(`Reject withdrawal for ${tx.user?.email}? Their balance will be refunded.`)) return;
    setActionLoading(tx._id);
    try {
      await api.post(`/wallet/withdrawals/${tx._id}/reject`, {
        note: noteInputs[tx._id] || 'Rejected by merchant'
      });
      setPendingWithdrawals(prev => prev.filter(t => t._id !== tx._id));
      setMessage({ type: 'success', text: `Withdrawal rejected. Balance refunded to ${tx.user?.email}.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Action failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title">Merchant Admin</h1>
            <p className="page-subtitle">Pending withdrawal requests from users</p>
          </div>
          <button onClick={fetchPending} className="btn-secondary text-sm">
            ↻ Refresh
          </button>
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

        {/* How it works */}
        <div className="card mb-6 border-blue-200 bg-blue-50">
          <p className="text-sm font-semibold text-blue-900 mb-1">How to process a withdrawal</p>
          <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
            <li>Open your <strong>Razorpay dashboard</strong> or any UPI app</li>
            <li>Send the amount to the user's UPI ID / bank account shown below</li>
            <li>Paste the <strong>UTR / Transaction ID</strong> in the Reference field</li>
            <li>Click <strong>"Mark as Paid"</strong> — user will see "Paid Out" status instantly</li>
          </ol>
        </div>

        {/* Pending list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner mx-auto" />
          </div>
        ) : pendingWithdrawals.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-3xl mb-3">✅</p>
            <h2 className="text-lg font-semibold text-surface-800 mb-1">All Clear</h2>
            <p className="text-sm text-surface-400">No pending withdrawal requests.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-surface-500 font-medium">
              {pendingWithdrawals.length} pending request{pendingWithdrawals.length !== 1 ? 's' : ''}
            </p>
            {pendingWithdrawals.map(tx => {
              const amt = Math.abs(tx.amount);
              const d = tx.withdrawalDetails || {};
              const isLoading = actionLoading === tx._id;

              return (
                <div key={tx._id} className="card border-amber-200">
                  {/* Top row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <div>
                      <p className="text-xs text-surface-400">
                        {new Date(tx.createdAt).toLocaleString('en-IN')}
                      </p>
                      <p className="font-semibold text-surface-900">{tx.user?.email}</p>
                      {tx.user?.phone && (
                        <p className="text-xs text-surface-400">{tx.user.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold font-mono text-surface-900">₹{amt}</p>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
                        Pending
                      </span>
                    </div>
                  </div>

                  {/* Payment details */}
                  <div className="rounded-lg bg-surface-50 border border-surface-200 px-4 py-3 mb-4 space-y-1.5">
                    <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                      Send via {d.method}
                    </p>
                    {d.method === 'UPI' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-surface-600">UPI ID</span>
                        <span className="font-mono font-semibold text-surface-900 text-sm select-all">
                          {d.upiId}
                        </span>
                      </div>
                    )}
                    {d.method === 'Bank Transfer' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-surface-600">Account Name</span>
                          <span className="font-semibold text-surface-900 text-sm">{d.accountName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-surface-600">Account Number</span>
                          <span className="font-mono font-semibold text-surface-900 text-sm select-all">{d.accountNumber}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-surface-600">IFSC Code</span>
                          <span className="font-mono font-semibold text-surface-900 text-sm">{d.ifscCode}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* UTR / Reference input */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-surface-500 mb-1.5">
                      UTR / Transaction Reference (optional but recommended)
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. UTR1234567890 or Razorpay payout ID"
                      value={noteInputs[tx._id] || ''}
                      onChange={e => setNoteInputs(prev => ({ ...prev, [tx._id]: e.target.value }))}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleComplete(tx)}
                      disabled={isLoading}
                      className="btn-success flex-1"
                    >
                      {isLoading ? 'Processing...' : `✓ Mark as Paid (₹${amt})`}
                    </button>
                    <button
                      onClick={() => handleReject(tx)}
                      disabled={isLoading}
                      className="btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
