const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ email, phone, password });
    await user.save();

    // Emit real-time update
    if (global.io) {
      global.io.emit('newUser', {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret');
    res.status(201).json({ token, user: { id: user._id, email: user.email, phone: user.phone, walletBalance: user.walletBalance, depositMade: user.depositMade, cashbackReceived: user.cashbackReceived } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    
    const user = await User.findOne({ email }).populate('rentalHistory');
    console.log('User found:', !!user);
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    const isValidPassword = await user.comparePassword(password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret');
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        phone: user.phone,
        walletBalance: user.walletBalance,
        rentalHistory: user.rentalHistory,
        depositMade: user.depositMade,
        cashbackReceived: user.cashbackReceived,
        createdAt: user.createdAt
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('rentalHistory');
    
    // Auto-approve and credit admins for seamless testing
    if (['palisettysanjaykumar@gmail.com', 'sanjay@cu.edu.in'].includes(user.email)) {
      if (!user.depositMade) {
        user.depositMade = true;
        user.walletBalance = (user.walletBalance || 0) + 400; // Provide starting funds
        await user.save();
      }
    }

    res.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        phone: user.phone,
        walletBalance: user.walletBalance,
        rentalHistory: user.rentalHistory,
        depositMade: user.depositMade,
        cashbackReceived: user.cashbackReceived,
        googleId: user.googleId,
        createdAt: user.createdAt
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { email, phone, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    if (newPassword && !user.googleId) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password required' });
      }
      
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      user.password = newPassword;
      await user.save(); // Save password change immediately
    }
    
    user.email = email;
    user.phone = phone;
    await user.save();
    
    res.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        phone: user.phone,
        walletBalance: user.walletBalance,
        depositMade: user.depositMade,
        cashbackReceived: user.cashbackReceived,
        createdAt: user.createdAt
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Account
router.delete('/profile', auth, async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const Rental = require('../models/Rental');
    
    // Delete related data first
    await Transaction.deleteMany({ user: req.user._id });
    await Rental.deleteMany({ user: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, sub: googleId } = payload;
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        email,
        googleId,
        walletBalance: 0,
        depositMade: false,
        cashbackReceived: false
      });
      await user.save();
      
      if (global.io) {
        global.io.emit('newUser', {
          id: user._id,
          email: user.email,
          createdAt: user.createdAt
        });
      }
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret');
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        walletBalance: user.walletBalance,
        depositMade: user.depositMade,
        cashbackReceived: user.cashbackReceived
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Google authentication failed' });
  }
});

// Mock Google login for testing
router.post('/google-mock', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        email,
        googleId: 'mock_google_id',
        walletBalance: 0,
        depositMade: false,
        cashbackReceived: false
      });
      await user.save();
      
      // Emit real-time update
      if (global.io) {
        global.io.emit('newUser', {
          id: user._id,
          email: user.email,
          createdAt: user.createdAt
        });
      }
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret');
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        walletBalance: user.walletBalance,
        depositMade: user.depositMade,
        cashbackReceived: user.cashbackReceived
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Google authentication failed' });
  }
});

module.exports = router;