const express = require('express');
const Rental = require('../models/Rental');
const Umbrella = require('../models/Umbrella');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// Start rental
router.post('/start', auth, async (req, res) => {
  try {
    const { umbrellaId } = req.body;
    
    const user = await User.findById(req.user._id);
    const adminEmails = (process.env.ADMIN_EMAILS || 'palisettysanjaykumar@gmail.com,sanjay@cu.edu.in').split(',');
    const isAdmin = adminEmails.includes(user.email);
    
    if (!user.depositMade && !isAdmin) {
      return res.status(400).json({ message: 'Please make initial deposit first' });
    }

    // Atomic lock to prevent race conditions
    const umbrella = await Umbrella.findOneAndUpdate(
      { _id: umbrellaId, isAvailable: true },
      { isAvailable: false },
      { new: true }
    );

    if (!umbrella) {
      return res.status(400).json({ message: 'Umbrella is no longer available' });
    }

    const rental = new Rental({
      user: user._id,
      umbrella: umbrella._id
    });
    
    await rental.save();
    
    umbrella.currentRental = rental._id;
    await umbrella.save();
    
    // Emit real-time updates
    if (global.io) {
      global.io.emit('newRental', {
        id: rental._id,
        user: user.email,
        umbrellaId: umbrella.umbrellaId,
        createdAt: rental.createdAt
      });
      global.io.emit('umbrellaUpdate', {
        id: umbrella._id,
        isAvailable: false
      });
    }

    res.status(201).json(rental);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start multiple rentals
router.post('/start-multiple', auth, async (req, res) => {
  try {
    const { umbrellaIds } = req.body;
    
    const user = await User.findById(req.user._id);
    const adminEmails = (process.env.ADMIN_EMAILS || 'palisettysanjaykumar@gmail.com,sanjay@cu.edu.in').split(',');
    const isAdmin = adminEmails.includes(user.email);
    
    if (!user.depositMade && !isAdmin) {
      return res.status(400).json({ message: 'Please make initial deposit first' });
    }

    const lockedUmbrellas = [];
    try {
      // Loop and atomically lock each umbrella
      for (const uId of umbrellaIds) {
        const umbrella = await Umbrella.findOneAndUpdate(
          { _id: uId, isAvailable: true },
          { isAvailable: false },
          { new: true }
        );
        if (!umbrella) {
          throw new Error('Umbrella unavailable');
        }
        lockedUmbrellas.push(umbrella);
      }
    } catch (error) {
      // Rollback if any single umbrella was snatched by another user
      for (const umbrella of lockedUmbrellas) {
        await Umbrella.findByIdAndUpdate(umbrella._id, { isAvailable: true });
      }
      return res.status(400).json({ message: 'One or more selected umbrellas were just taken. Please refresh and try again.' });
    }

    const rentals = [];
    for (const umbrella of lockedUmbrellas) {
      const rental = new Rental({
        user: user._id,
        umbrella: umbrella._id
      });
      await rental.save();
      rentals.push(rental);
      
      umbrella.currentRental = rental._id;
      await umbrella.save();
    }

    res.status(201).json({ rentals, count: rentals.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process payment and unlock
router.post('/:id/pay', auth, async (req, res) => {
  try {
    const { paymentId, paymentMethod } = req.body;
    const rental = await Rental.findById(req.params.id).populate('umbrella user');
    
    if (!rental) return res.status(404).json({ message: 'Rental not found' });
    
    // Calculate current cost
    const hours = Math.ceil((new Date() - rental.startTime) / (1000 * 60 * 60));
    const currentCost = hours <= 7 ? (hours || 1) * 7 : Math.ceil(hours / 24) * 70;
    
    // Check wallet balance
    const user = await User.findById(rental.user._id);
    if (user.walletBalance < currentCost) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }
    
    // Deduct from wallet
    user.walletBalance -= currentCost;
    await user.save();
    
    // Update rental
    rental.paymentStatus = 'completed';
    rental.paymentId = paymentId;
    rental.unlocked = true;
    rental.unlockedAt = new Date();   // timer starts from here
    rental.totalAmount = currentCost;
    await rental.save();
    
    // Record transaction
    const transaction = await new Transaction({
      user: user._id,
      type: 'rental',
      amount: -currentCost,
      description: `Rental payment for ${rental.umbrella.umbrellaId} via ${paymentMethod || 'Card'}`
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

    res.json({ 
      message: 'Payment successful, umbrella unlocked', 
      rental,
      walletBalance: user.walletBalance,
      amountDeducted: currentCost
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Pay for all active rentals
router.post('/pay-all', auth, async (req, res) => {
  try {
    const { paymentId, paymentMethod } = req.body;
    
    const activeRentals = await Rental.find({ 
      user: req.user._id, 
      isActive: true,
      unlocked: false
    }).populate('umbrella');
    
    if (activeRentals.length === 0) {
      return res.status(404).json({ message: 'No unpaid rentals found' });
    }
    
    // Calculate total cost for all rentals
    let totalCost = 0;
    const rentalCosts = [];
    
    activeRentals.forEach(rental => {
      const hours = Math.ceil((new Date() - rental.startTime) / (1000 * 60 * 60));
      const cost = hours <= 7 ? (hours || 1) * 7 : Math.ceil(hours / 24) * 70;
      totalCost += cost;
      rentalCosts.push({ rental, cost });
    });
    
    // Check wallet balance
    const user = await User.findById(req.user._id);
    if (user.walletBalance < totalCost) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }
    
    // Deduct from wallet
    user.walletBalance -= totalCost;
    await user.save();
    
    // Update all rentals
    const updatedRentals = [];
    for (const { rental, cost } of rentalCosts) {
      rental.paymentStatus = 'completed';
      rental.paymentId = paymentId;
      rental.unlocked = true;
      rental.unlockedAt = new Date();   // timer starts from here
      rental.totalAmount = cost;
      await rental.save();
      updatedRentals.push(rental);
      
      // Record detailed individual transactions
      const hours = Math.ceil((new Date() - rental.startTime) / (1000 * 60 * 60));
      await new Transaction({
        user: user._id,
        type: 'rental',
        amount: -cost,
        description: `Rental payment for ${rental.umbrella.umbrellaId} via ${paymentMethod || 'Card'}`,
        umbrella: rental.umbrella._id,
        rental: rental._id,
        duration: hours,
        rentalStartTime: rental.startTime,
        rentalEndTime: new Date()
      }).save();
    }

    res.json({ 
      message: `Payment successful, ${activeRentals.length} umbrellas unlocked`, 
      rentals: updatedRentals,
      walletBalance: user.walletBalance,
      amountDeducted: totalCost,
      count: activeRentals.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// End multiple rentals
router.post('/end-multiple', auth, async (req, res) => {
  try {
    const { rentalIds, dropOffLocation } = req.body;
    
    if (!rentalIds || !Array.isArray(rentalIds) || rentalIds.length === 0) {
      return res.status(400).json({ message: 'No rentals provided' });
    }

    const rentals = await Rental.find({
      _id: { $in: rentalIds },
      user: req.user._id,
      isActive: true
    }).populate('umbrella user');

    if (rentals.length === 0) {
      return res.status(404).json({ message: 'No active rentals found to end' });
    }

    const user = await User.findById(req.user._id);
    const updatedRentals = [];

    for (const rental of rentals) {
      rental.endTime = new Date();
      const hours = Math.ceil((rental.endTime - rental.startTime) / (1000 * 60 * 60));
      rental.duration = hours;
      // Recalculate cost just in case, though usually pre-paid at unlock
      rental.totalAmount = hours <= 7 ? (hours || 1) * 7 : Math.ceil(hours / 24) * 70;
      rental.isActive = false;
      
      if (dropOffLocation) {
        rental.dropOffLocation = dropOffLocation;
      }
      
      await rental.save();
      updatedRentals.push(rental);

      // Update user history
      if (!user.rentalHistory.includes(rental._id)) {
        user.rentalHistory.push(rental._id);
      }

      // Update umbrella
      const umbrella = await Umbrella.findById(rental.umbrella._id);
      if (umbrella) {
        if (dropOffLocation) {
          umbrella.location = {
            address: dropOffLocation.address || dropOffLocation.name,
            latitude: dropOffLocation.lat || dropOffLocation.latitude,
            longitude: dropOffLocation.lng || dropOffLocation.longitude
          };
        }
        umbrella.isAvailable = true;
        umbrella.currentRental = null;
        await umbrella.save();

        // Emit real-time events
        if (global.io) {
          global.io.emit('rentalEnded', {
            id: rental._id,
            umbrellaId: umbrella.umbrellaId,
            user: user.email,
            endTime: rental.endTime
          });
          global.io.emit('umbrellaUpdate', {
            id: umbrella._id,
            isAvailable: true,
            location: umbrella.location
          });
        }
      }
    }

    await user.save();

    res.json({ 
      message: `Successfully dropped off ${updatedRentals.length} umbrellas`,
      rentals: updatedRentals,
      walletBalance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// End rental (Single)
router.post('/:id/end', auth, async (req, res) => {
  try {
    const { dropOffLocation } = req.body;
    const rental = await Rental.findById(req.params.id).populate('umbrella user');
    if (!rental) return res.status(404).json({ message: 'Rental not found' });

    rental.endTime = new Date();
    const hours = Math.ceil((rental.endTime - rental.startTime) / (1000 * 60 * 60));
    rental.duration = hours;
    rental.totalAmount = hours <= 7 ? hours * 7 : Math.ceil(hours / 24) * 70;
    rental.isActive = false;
    
    if (dropOffLocation) {
      rental.dropOffLocation = dropOffLocation;
    }
    
    await rental.save();

    // Update user rental history
    const user = await User.findById(rental.user._id);
    user.rentalHistory.push(rental._id);
    await user.save();

    // Update umbrella location and availability
    const umbrella = await Umbrella.findById(rental.umbrella._id);
    if (dropOffLocation) {
      umbrella.location = {
        address: dropOffLocation.address,
        latitude: dropOffLocation.latitude,
        longitude: dropOffLocation.longitude
      };
    }
    umbrella.isAvailable = true;
    umbrella.currentRental = null;
    await umbrella.save();

    // Emit real-time updates
    if (global.io) {
      global.io.emit('rentalEnded', {
        id: rental._id,
        umbrellaId: umbrella.umbrellaId,
        user: user.email,
        endTime: rental.endTime
      });
      global.io.emit('umbrellaUpdate', {
        id: umbrella._id,
        isAvailable: true,
        location: umbrella.location
      });
    }

    res.json({
      rental,
      walletBalance: user.walletBalance,
      invoice: {
        umbrellaId: rental.umbrella.umbrellaId,
        duration: rental.duration,
        amount: rental.totalAmount,
        date: rental.endTime,
        dropOffLocation: rental.dropOffLocation
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active rentals
router.get('/active', auth, async (req, res) => {
  try {
    const rentals = await Rental.find({ 
      user: req.user._id, 
      isActive: true 
    }).populate('umbrella').lean();
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get rental history
router.get('/history', auth, async (req, res) => {
  try {
    const rentals = await Rental.find({ user: req.user._id })
      .populate('umbrella')
      .sort({ createdAt: -1 })
      .lean();
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel a rental that hasn't been paid/unlocked yet
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('umbrella');
    if (!rental) return res.status(404).json({ message: 'Rental not found' });

    // Only allow cancelling if it belongs to this user and is still locked (not paid)
    if (String(rental.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorised' });
    }
    if (rental.unlocked) {
      return res.status(400).json({ message: 'Rental is already paid and unlocked — drop it off instead of cancelling.' });
    }

    // Free the umbrella
    const umbrella = await Umbrella.findById(rental.umbrella._id);
    if (umbrella) {
      umbrella.isAvailable = true;
      umbrella.currentRental = null;
      await umbrella.save();
      if (global.io) {
        global.io.emit('umbrellaUpdate', { id: umbrella._id, isAvailable: true });
      }
    }

    // Remove the rental record entirely
    await Rental.findByIdAndDelete(rental._id);

    // Check remaining active rentals (for UI state)
    const user = await User.findById(req.user._id);
    const remainingActive = await Rental.countDocuments({ user: user._id, isActive: true });

    res.json({
      message: 'Rental cancelled successfully.',
      walletBalance: user.walletBalance,
      remainingActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;