const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if user exists
    const email = 'student1@cu.edu.in';
    const password = 'password123';
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      console.log('Creating test user...');
      
      const newUser = new User({
        email,
        phone: '9876543210',
        password,
        walletBalance: 450,
        depositMade: true,
        cashbackReceived: true
      });
      
      await newUser.save();
      console.log('✅ Test user created');
      
      // Test login
      const testUser = await User.findOne({ email });
      const isValid = await testUser.comparePassword(password);
      console.log('✅ Password check:', isValid);
    } else {
      console.log('✅ User found:', user.email);
      console.log('Has password:', !!user.password);
      
      if (user.password) {
        const isValid = await user.comparePassword(password);
        console.log('Password valid:', isValid);
      } else {
        console.log('❌ User has no password - fixing...');
        user.password = password;
        await user.save();
        console.log('✅ Password set');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testLogin();
