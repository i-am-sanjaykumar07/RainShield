const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testSeed() {
  try {
    await mongoose.connect('mongodb+srv://palisettysanjaykumar_db_user:StPcfumQIOvDAEtS@urs.h9jrkne.mongodb.net/demo');
    
    // Clear users
    await User.deleteMany({});
    
    // Create one test user
    const user = new User({
      email: 'test@cu.edu.in',
      phone: '9876543210',
      password: 'password123',
      walletBalance: 400,
      depositMade: true,
      cashbackReceived: true
    });
    
    await user.save();
    console.log('✅ Test user created:', user.email);
    
    // Test login
    const foundUser = await User.findOne({ email: 'test@cu.edu.in' });
    const isValid = await foundUser.comparePassword('password123');
    console.log('🔐 Password check:', isValid);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testSeed();