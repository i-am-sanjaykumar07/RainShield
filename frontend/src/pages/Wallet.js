import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

const Wallet = () => {
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState(7);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState({ type: '', text: '' });

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await api.get('/wallet/transactions');
      setTransactions(response.data);
    } catch {
      // Failed to fetch
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDeposit = () => {
    if (amount < 7) return;
    setShowPaymentModal(true);
  };

  const processPayment = async (method) => {
    setLoading(true);
    try {
      const { data: order } = await api.post('/wallet/deposit', { amount });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_SVlA2VxGM7X1gi',
        amount: order.amount,
        currency: "INR",
        name: "RainShield",
        description: "Wallet Deposit",
        order_id: order.orderId,
        handler: async function (response) {
          try {
            const verifyResponse = await api.post('/wallet/verify-deposit', {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              amount,
              paymentMethod: method,
            });

            updateUser({ walletBalance: verifyResponse.data.walletBalance });
            fetchTransactions();
            setAmount(300);
            setShowPaymentModal(false);
          } catch (err) {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: user?.name || "User",
          email: user?.email || "",
        },
        theme: {
          color: "#4f46e5"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay Error:", err.response?.data || err);
      alert(err.response?.data?.message || 'Failed to initialize payment. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawMsg({ type: '', text: '' });
    const amt = Number(withdrawAmount);
    if (!amt || amt < 50) {
      setWithdrawMsg({ type: 'error', text: 'Minimum withdrawal is ₹50.' });
      return;
    }
    if (amt > (user?.walletBalance || 0)) {
      setWithdrawMsg({ type: 'error', text: 'Insufficient wallet balance.' });
      return;
    }
    setWithdrawLoading(true);
    try {
      const res = await api.post('/wallet/withdraw', {
        amount: amt,
        method: withdrawMethod,
        upiId: withdrawMethod === 'UPI' ? upiId : undefined,
        accountNumber: withdrawMethod === 'Bank Transfer' ? accountNumber : undefined,
        ifscCode: withdrawMethod === 'Bank Transfer' ? ifscCode : undefined,
        accountName: withdrawMethod === 'Bank Transfer' ? accountName : undefined,
      });
      updateUser({ walletBalance: res.data.walletBalance });
      fetchTransactions();
      setWithdrawAmount('');
      setUpiId('');
      setAccountNumber('');
      setIfscCode('');
      setAccountName('');
      setWithdrawMsg({ type: 'success', text: res.data.message });
    } catch (err) {
      setWithdrawMsg({ type: 'error', text: err.response?.data?.message || 'Withdrawal failed.' });
    } finally {
      setWithdrawLoading(false);
    }
  };

  const txIcon = (type) => {
    const icons = { deposit: '↑', cashback: '★', rental: '☂', refund: '↩', withdrawal: '↓' };
    return icons[type] || '•';
  };

  const txColor = (type) => {
    const colors = {
      deposit: 'bg-emerald-50 text-emerald-600',
      cashback: 'bg-amber-50 text-amber-600',
      rental: 'bg-brand-50 text-brand-600',
      refund: 'bg-blue-50 text-blue-600',
      withdrawal: 'bg-red-50 text-red-600',
    };
    return colors[type] || 'bg-surface-100 text-surface-600';
  };

  const paymentMethods = [
    { method: 'UPI', desc: 'Pay using UPI ID' },
    { method: 'QR Code', desc: 'Scan QR to pay' },
    { method: 'Card', desc: 'Visa, Mastercard, RuPay' },
    { method: 'Wallet', desc: 'Paytm, PhonePe, GPay' },
  ];

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        {/* Header */}
        <div className="mb-6">
          <h1 className="page-title">Wallet</h1>
          <p className="page-subtitle">Manage your funds</p>
        </div>

        {/* Balance Card */}
        <div className="card mb-4">
          <p className="section-label mb-2">Current Balance</p>
          <p className="stat-value text-surface-900 mb-3">₹{user?.walletBalance || 0}</p>
          {!user?.depositMade && (
            <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
              First deposit of ₹300+ earns a ₹100 cashback bonus.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Add Money Card */}
          <div className="card">
            <p className="section-title mb-4">Add Money</p>
            <input
              type="number"
              className="input-field mb-3"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min="7"
            />
            <div className="flex flex-wrap gap-2 mb-4">
              {[300, 500, 1000, 2000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium font-mono transition-all duration-200 ${
                    amount === preset
                      ? 'bg-surface-900 text-white'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
            <button
              className="btn-primary btn-full"
              onClick={() => processPayment('Razorpay')}
              disabled={loading || amount < 7}
            >
              {loading ? 'Processing...' : `Add ₹${amount}`}
            </button>
          </div>

          {/* Withdraw Card */}
          <div className="card">
            <p className="section-title mb-4">Withdraw Money</p>

            {/* Feedback message */}
            {withdrawMsg.text && (
              <div className={`mb-4 px-4 py-3 rounded-xl text-sm border animate-fade-in ${
                withdrawMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {withdrawMsg.text}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-3">
              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Amount</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Min ₹50"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="50"
                  required
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {[100, 200, 500, 1000].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setWithdrawAmount(String(preset))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all duration-200 ${
                        Number(withdrawAmount) === preset
                          ? 'bg-surface-900 text-white'
                          : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                      }`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Method toggle */}
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">Withdraw To</label>
                <div className="flex bg-surface-100 rounded-lg p-0.5">
                  {['UPI', 'Bank Transfer'].map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => { setWithdrawMethod(m); setWithdrawMsg({ type: '', text: '' }); }}
                      className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                        withdrawMethod === m
                          ? 'bg-white text-surface-900 shadow-soft'
                          : 'text-surface-500 hover:text-surface-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI fields */}
              {withdrawMethod === 'UPI' && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-medium text-surface-500 mb-1.5">UPI ID</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Bank Transfer fields */}
              {withdrawMethod === 'Bank Transfer' && (
                <div className="space-y-2 animate-fade-in">
                  <div>
                    <label className="block text-xs font-medium text-surface-500 mb-1.5">Account Holder Name</label>
                    <input type="text" className="input-field" placeholder="Full name" value={accountName} onChange={(e) => setAccountName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-500 mb-1.5">Account Number</label>
                    <input type="text" className="input-field" placeholder="Account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-500 mb-1.5">IFSC Code</label>
                    <input type="text" className="input-field" placeholder="e.g. SBIN0001234" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} required />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn-danger btn-full mt-1"
                disabled={withdrawLoading}
              >
                {withdrawLoading ? 'Processing...' : `Withdraw ₹${withdrawAmount || '0'}`}
              </button>
            </form>

            <p className="text-[11px] text-surface-400 mt-3 text-center">
              Funds credited within 1–3 business days.
            </p>
          </div>
        </div>

        {/* Transactions */}
        <div className="card">
          <h3 className="section-title mb-4">Transaction History</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-surface-400 text-sm">No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-surface-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${txColor(tx.type)}`}>
                      {txIcon(tx.type)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-surface-800 capitalize">{tx.type}</p>
                      <p className="text-xs text-surface-400">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                      {tx.description && (
                        <p className="text-xs text-surface-400 mt-0.5">{tx.description}</p>
                      )}
                    </div>
                  </div>
                  <span className={`font-mono text-sm font-semibold ${
                    tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
