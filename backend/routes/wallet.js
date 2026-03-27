const express = require('express');
const Razorpay = require('razorpay');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret'
});

console.log('💳 Razorpay initialized with key:', process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 12) + '...' : 'MISSING');

// Create deposit order
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount < 7) {
      return res.status(400).json({ message: 'Amount must be at least ₹7' });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `dep_${req.user._id.toString().slice(-8)}_${Date.now().toString(36)}`
    });

    res.json({ orderId: order.id, amount: order.amount });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ message: error.error?.description || error.message || 'Razorpay order creation failed' });
  }
});

// Verify deposit payment
router.post('/verify-deposit', auth, async (req, res) => {
  try {
    const { paymentId, amount, paymentMethod } = req.body;
    
    // Update user wallet
    const user = await User.findById(req.user._id);
    user.walletBalance += amount;
    
    // Mark account as active on any deposit
    if (!user.depositMade) {
      user.depositMade = true;
      user.depositAmount = 100; // ₹100 refundable deposit held until umbrella is returned
    }

    // ₹100 cashback only on first deposit ≥ ₹300 (and not already received)
    if (!user.cashbackReceived && amount >= 300) {
      user.walletBalance += 100;
      user.cashbackReceived = true;

      // Record cashback transaction
      const cashbackTransaction = await new Transaction({
        user: user._id,
        type: 'cashback',
        amount: 100,
        description: 'First deposit cashback (₹300+ deposit)'
      }).save();

      // Emit real-time update
      if (global.io) {
        global.io.emit('newTransaction', {
          id: cashbackTransaction._id,
          type: cashbackTransaction.type,
          amount: cashbackTransaction.amount,
          user: user.email,
          createdAt: cashbackTransaction.createdAt
        });
      }
    }
    
    await user.save();

    // Record deposit transaction
    const transaction = await new Transaction({
      user: user._id,
      type: 'deposit',
      amount,
      paymentId,
      description: `Wallet deposit via ${paymentMethod || 'Card'}`
    }).save();
    
    // Emit real-time updates
    if (global.io) {
      global.io.emit('newTransaction', {
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        user: user.email,
        createdAt: transaction.createdAt
      });
      global.io.emit('walletUpdate', {
        userId: user._id,
        newBalance: user.walletBalance
      });
    }

    res.json({ walletBalance: user.walletBalance, message: 'Deposit successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Withdraw from wallet
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, method, upiId, accountNumber, ifscCode, accountName } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₹50' });
    }

    const user = await User.findById(req.user._id);

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    if (method === 'UPI' && !upiId) {
      return res.status(400).json({ message: 'UPI ID is required' });
    }

    if (method === 'Bank Transfer' && (!accountNumber || !ifscCode || !accountName)) {
      return res.status(400).json({ message: 'Account number, IFSC code and account name are required' });
    }

    user.walletBalance -= amount;
    await user.save();

    const transaction = await new Transaction({
      user: user._id,
      type: 'withdrawal',
      amount: -amount,
      description: `Withdrawal via ${method}${method === 'UPI' ? ` to ${upiId}` : ''}`,
      withdrawalDetails: { upiId, accountNumber, method }
    }).save();

    if (global.io) {
      global.io.emit('newTransaction', {
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        user: user.email,
        createdAt: transaction.createdAt
      });
      global.io.emit('walletUpdate', {
        userId: user._id,
        newBalance: user.walletBalance
      });
    }

    res.json({
      walletBalance: user.walletBalance,
      message: `Withdrawal of ₹${amount} initiated successfully. Funds will be credited within 1-3 business days.`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get transaction history with user details
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('user', 'email phone')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;