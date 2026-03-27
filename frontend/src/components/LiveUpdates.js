import React, { useState, useEffect, useCallback } from 'react';
import { subscribeToUpdates, unsubscribeFromUpdates } from '../services/socket';

const LiveUpdates = () => {
  const [updates, setUpdates] = useState([]);

  const handleUpdate = useCallback((data) => {
    setUpdates(prev => [{ ...data, id: Date.now() }, ...prev.slice(0, 3)]);
  }, []);

  useEffect(() => {
    subscribeToUpdates(handleUpdate);
    return () => unsubscribeFromUpdates();
  }, [handleUpdate]);

  useEffect(() => {
    if (updates.length === 0) return;
    const timer = setTimeout(() => {
      setUpdates(prev => prev.slice(0, -1));
    }, 5000);
    return () => clearTimeout(timer);
  }, [updates]);

  if (updates.length === 0) return null;

  const getLabel = (update) => {
    if (update.type === 'deposit') return { icon: '↑', text: `Deposit: ₹${update.amount}`, color: 'text-emerald-600 bg-emerald-50' };
    if (update.type === 'cashback') return { icon: '★', text: `Cashback: ₹${update.amount}`, color: 'text-amber-600 bg-amber-50' };
    return { icon: '→', text: `New user joined`, color: 'text-brand-600 bg-brand-50' };
  };

  return (
    <div className="fixed top-20 right-4 z-40 flex flex-col gap-2 max-w-xs">
      {updates.map((update) => {
        const { icon, text, color } = getLabel(update);
        return (
          <div
            key={update.id}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-surface-200 bg-white shadow-elevated animate-slide-in-right`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${color}`}>
              {icon}
            </span>
            <span className="text-sm text-surface-700 font-medium">{text}</span>
          </div>
        );
      })}
    </div>
  );
};

export default LiveUpdates;