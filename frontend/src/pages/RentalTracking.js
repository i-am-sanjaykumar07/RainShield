import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TrackingMap from '../components/TrackingMap';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

const RentalTracking = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeRentals, setActiveRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showDropOffModal, setShowDropOffModal] = useState(false);
  const [selectedDropOffLocation, setSelectedDropOffLocation] = useState(null);
  const [selectedUmbrellasForDropOff, setSelectedUmbrellasForDropOff] = useState([]);
  const [campusLocations, setCampusLocations] = useState([]);

  const getTotalUnpaidCost = useCallback(() => {
    let total = 0;
    activeRentals.filter(r => !r.unlocked).forEach(rental => {
      const diff = currentTime - new Date(rental.startTime);
      const hours = Math.floor(diff / 3600000);
      total += hours <= 7 ? (hours + 1) * 7 : Math.ceil((hours + 1) / 24) * 70;
    });
    return total;
  }, [activeRentals, currentTime]);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await api.get('/umbrellas');
      const seen = new Set();
      const locs = [];
      response.data.forEach(u => {
        if (u.location?.address && !seen.has(u.location.address)) {
          seen.add(u.location.address);
          locs.push({
            name: u.location.address.split(',')[0],
            address: u.location.address,
            lat: u.location.latitude,
            lng: u.location.longitude,
          });
        }
      });
      setCampusLocations(locs);
    } catch {
      // Failed
    }
  }, []);

  const fetchActiveRentals = useCallback(async () => {
    try {
      const response = await api.get('/rentals/active');
      const rentals = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean);
      setActiveRentals(rentals);
      if (rentals.length > 0) setSelectedRental(rentals[0]);
    } catch {
      // No active rentals
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveRentals();
    fetchLocations();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [fetchActiveRentals, fetchLocations]);

  const getDuration = () => {
    if (!selectedRental) return { hours: 0, minutes: 0, seconds: 0 };
    const diff = currentTime - new Date(selectedRental.startTime);
    return {
      hours: Math.floor(diff / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };

  const getCost = () => {
    const { hours } = getDuration();
    if (hours === 0) return 7;
    return hours <= 7 ? (hours + 1) * 7 : Math.ceil((hours + 1) / 24) * 70;
  };

  const executeSinglePayment = async () => {
    try {
      const response = await api.post(`/rentals/${selectedRental._id}/pay`, {
        paymentId: `wallet_${Date.now()}`,
        paymentMethod: 'Wallet',
      });
      setSelectedRental(prev => ({ ...prev, unlocked: true, paymentStatus: 'completed' }));
      setActiveRentals(prev => prev.map(r => r._id === selectedRental._id ? { ...r, unlocked: true } : r));
      updateUser({ walletBalance: response.data.walletBalance });
    } catch {
      alert('Wallet deduction failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const executeBulkPayment = async () => {
    try {
      const response = await api.post('/rentals/pay-all', {
        paymentId: `wallet_${Date.now()}`,
        paymentMethod: 'Wallet',
      });
      const updatedRentals = response.data.rentals;
      setActiveRentals(prev => prev.map(r => {
        const updated = updatedRentals.find(ur => ur._id === r._id);
        return updated ? { ...r, unlocked: true, paymentStatus: 'completed' } : r;
      }));
      if (selectedRental && !selectedRental.unlocked) {
        setSelectedRental(prev => ({ ...prev, unlocked: true, paymentStatus: 'completed' }));
      }
      updateUser({ walletBalance: response.data.walletBalance });
    } catch (error) {
      alert(error.response?.data?.message || 'Bulk payment failed.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentWithWalletCheck = async (isBulk) => {
    if (paymentLoading) return;
    setPaymentLoading(true);

    try {
      const cost = isBulk ? getTotalUnpaidCost() : getCost();
      const currentBalance = user?.walletBalance || 0;
      
      if (currentBalance < cost) {
        // Insufficient balance -> auto top-up via Razorpay
        const deficit = cost - currentBalance;
        const depositAmount = Math.max(deficit, 1); // Razorpay needs at least 1 INR
        
        const { data: order } = await api.post('/wallet/deposit', { amount: depositAmount });
        
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_SVlA2VxGM7X1gi',
          amount: order.amount,
          currency: "INR",
          name: "RainShield",
          description: "Wallet Top-up for Umbrella",
          order_id: order.orderId,
          handler: async function (response) {
            try {
              const verifyResponse = await api.post('/wallet/verify-deposit', {
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                amount: depositAmount,
                paymentMethod: 'Razorpay',
              });
              updateUser({ walletBalance: verifyResponse.data.walletBalance });
              
              // Now proceed with the actual rental payment
              if (isBulk) {
                await executeBulkPayment();
              } else {
                await executeSinglePayment();
              }
            } catch (err) {
              alert('Top-up verification failed.');
              setPaymentLoading(false);
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: { color: "#4f46e5" }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function () {
          alert("Top-up Failed");
          setPaymentLoading(false);
        });
        rzp.open();
        return; // wait for handler to finish
      } else {
        // Sufficient balance, just pay
        if (isBulk) {
          await executeBulkPayment();
        } else {
          await executeSinglePayment();
        }
      }
    } catch (err) {
      alert('Failed to initiate payment.');
      setPaymentLoading(false);
    }
  };

  const confirmEndRental = async () => {
    if (!selectedDropOffLocation || selectedUmbrellasForDropOff.length === 0) return;
    try {
      const dropOff = {
        address: selectedDropOffLocation.address,
        latitude: selectedDropOffLocation.lat,
        longitude: selectedDropOffLocation.lng,
      };
      
      let response;
      if (selectedUmbrellasForDropOff.length === 1) {
        response = await api.post(`/rentals/${selectedUmbrellasForDropOff[0]}/end`, { dropOffLocation: dropOff });
      } else {
        response = await api.post('/rentals/end-multiple', { 
          rentalIds: selectedUmbrellasForDropOff,
          dropOffLocation: dropOff 
        });
      }

      // Sync wallet balance & depositMade back to UI immediately
      if (response?.data?.walletBalance !== undefined) {
        updateUser({ walletBalance: response.data.walletBalance, depositMade: false });
      }

      setShowDropOffModal(false);
      navigate('/dashboard');
    } catch {
      alert('Failed to end rental.');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="page-content flex items-center justify-center py-20">
          <div className="text-center">
            <div className="spinner mx-auto mb-4" />
            <p className="text-surface-500 text-sm">Loading rentals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeRentals.length === 0) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="page-content">
          <div className="card text-center py-16">
            <p className="text-3xl mb-3">☂️</p>
            <h2 className="text-xl font-semibold text-surface-800 mb-2">No Active Rentals</h2>
            <p className="text-sm text-surface-400 mb-6">You don't have any active umbrella rentals.</p>
            <button onClick={() => navigate('/umbrellas')} className="btn-primary">
              Find an Umbrella
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { hours, minutes, seconds } = getDuration();
  const cost = getCost();

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        {/* Header */}
        <div className="mb-6">
          <h1 className="page-title">Tracking</h1>
          <p className="page-subtitle">{activeRentals.length} active rental{activeRentals.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Rental selector */}
        {activeRentals.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {activeRentals.map((rental) => (
              <button
                key={rental._id}
                onClick={() => setSelectedRental(rental)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedRental?._id === rental._id
                    ? 'bg-surface-900 text-white'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                {rental.umbrella?.umbrellaId}
              </button>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <p className="section-label mb-2">Duration</p>
            <p className="font-mono text-2xl md:text-3xl font-bold text-surface-900">
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
              <span className="text-surface-400 text-lg">:{String(seconds).padStart(2, '0')}</span>
            </p>
          </div>
          <div className="card text-center">
            <p className="section-label mb-2">Current Cost</p>
            <p className="font-mono text-2xl md:text-3xl font-bold text-surface-900">₹{cost}</p>
          </div>
          <div className="card text-center">
            <p className="section-label mb-2">Status</p>
            <span className={`badge text-sm ${selectedRental?.unlocked ? 'badge-success' : 'badge-warning'}`}>
              {selectedRental?.unlocked ? 'Unlocked' : 'Locked'}
            </span>
          </div>
        </div>

        {/* Details + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Details */}
          <div className="card">
            <h3 className="section-title mb-4">Umbrella Details</h3>
            <div className="space-y-3">
              {[
                { label: 'ID', value: selectedRental?.umbrella?.umbrellaId || 'N/A' },
                { label: 'Color', value: selectedRental?.umbrella?.color || 'N/A', capitalize: true },
                { label: 'Location', value: selectedRental?.umbrella?.location?.address || 'CU Campus' },
                { label: 'Started', value: selectedRental ? new Date(selectedRental.startTime).toLocaleString('en-IN') : 'N/A' },
              ].map(({ label, value, capitalize }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                  <span className="text-sm text-surface-500">{label}</span>
                  <span className={`text-sm font-medium text-surface-800 ${capitalize ? 'capitalize' : ''}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="card">
            <h3 className="section-title mb-4">Location</h3>
            <TrackingMap rental={selectedRental} />
          </div>
        </div>
        {/* Actions */}
        <div className="card">
          <h3 className="section-title mb-4">Actions</h3>
          <div className="flex flex-wrap gap-3">
            {/* Payment Actions */}
            {selectedRental && !selectedRental.unlocked && (
              <button 
                onClick={() => handlePaymentWithWalletCheck(false)} 
                disabled={paymentLoading}
                className="btn-primary btn-lg"
              >
                {paymentLoading ? 'Processing...' : `Pay Unlock Current (₹${cost})`}
              </button>
            )}
            {activeRentals.filter(r => !r.unlocked).length > 1 && (
              <button 
                onClick={() => handlePaymentWithWalletCheck(true)} 
                disabled={paymentLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-all text-sm disabled:opacity-50"
              >
                {paymentLoading ? 'Processing...' : `Pay & Unlock All (${activeRentals.filter(r => !r.unlocked).length})`}
              </button>
            )}

            {/* Drop Off Actions */}
            {selectedRental?.unlocked && (
              <button
                onClick={() => {
                  setSelectedUmbrellasForDropOff([selectedRental._id]);
                  setShowDropOffModal(true);
                }}
                className="btn-danger btn-lg"
              >
                Drop Off Current ({selectedRental.umbrella?.umbrellaId})
              </button>
            )}
            {activeRentals.filter(r => r.unlocked).length > 1 && (
              <button
                onClick={() => {
                  setSelectedUmbrellasForDropOff(activeRentals.filter(r => r.unlocked).map(r => r._id));
                  setShowDropOffModal(true);
                }}
                className="btn-secondary btn-lg"
              >
                Drop Off Multiple ({activeRentals.filter(r => r.unlocked).length})
              </button>
            )}

            <button onClick={() => navigate('/dashboard')} className="btn-ghost btn-lg ml-auto">
              ← Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Drop-off Modal */}
      {showDropOffModal && (
        <div className="modal-overlay" onClick={() => setShowDropOffModal(false)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Drop Off Location</h3>

            {/* Umbrella selection for multi-drop */}
            {activeRentals.filter(r => r.unlocked).length > 1 && (
              <div className="mb-6">
                <p className="section-label mb-2">Select Umbrellas</p>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {activeRentals.filter(r => r.unlocked).map((rental) => (
                    <label
                      key={rental._id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                        selectedUmbrellasForDropOff.includes(rental._id)
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-surface-200 hover:border-surface-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUmbrellasForDropOff.includes(rental._id)}
                        onChange={(e) => {
                          setSelectedUmbrellasForDropOff(prev =>
                            e.target.checked ? [...prev, rental._id] : prev.filter(id => id !== rental._id)
                          );
                        }}
                        className="accent-brand-600"
                      />
                      <span className="font-medium">{rental.umbrella?.umbrellaId}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <p className="section-label mb-2">Select Location</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto mb-6">
              {campusLocations.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => setSelectedDropOffLocation(loc)}
                  className={`px-3 py-2.5 rounded-lg border text-left text-sm transition-all ${
                    selectedDropOffLocation?.name === loc.name
                      ? 'border-brand-500 bg-brand-50 text-brand-800'
                      : 'border-surface-200 text-surface-700 hover:border-surface-300 hover:bg-surface-50'
                  }`}
                >
                  <p className="font-medium">{loc.name}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmEndRental}
                disabled={!selectedDropOffLocation || selectedUmbrellasForDropOff.length === 0}
                className="btn-success btn-full"
              >
                Drop {selectedUmbrellasForDropOff.length} Umbrella{selectedUmbrellasForDropOff.length !== 1 ? 's' : ''}
              </button>
              <button
                onClick={() => { setShowDropOffModal(false); setSelectedDropOffLocation(null); }}
                className="btn-secondary btn-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalTracking;
