const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Umbrella = require('./models/Umbrella');
const User = require('./models/User');
const Rental = require('./models/Rental');
const Transaction = require('./models/Transaction');
require('dotenv').config();

// Generate umbrellas with minimum 3 same color per location
const generateUmbrellas = () => {
  const colors = ['red', 'blue', 'yellow', 'black', 'green'];
  const locations = [
    'Main Gate', 'Central Library', 'Engineering Block', 'Student Activity Center', 'Boys Hostel Block A',
    'Food Court', 'Sports Complex', 'Administrative Block', 'Girls Hostel Block B', 'Medical Center',
    'Computer Science Block', 'Main Auditorium', 'Parking Area Gate 2', 'Faculty Residence', 'Business School',
    'Pharmacy Block', 'Law School', 'Architecture Block', 'Laboratory Complex', 'Research Center'
  ];
  
  const umbrellas = [];
  let umbrellaCounter = 1;
  
  // For each location, add at least 3 umbrellas of each color
  locations.forEach((location, locIndex) => {
    colors.forEach(color => {
      // Add 3 umbrellas of same color at same location
      for (let i = 0; i < 3; i++) {
        const baseLatitude = 30.7575 + (locIndex * 0.0001);
        const baseLongitude = 76.5660 + (locIndex * 0.0001);
        
        umbrellas.push({
          umbrellaId: `UMB${String(umbrellaCounter).padStart(3, '0')}`,
          color: color,
          location: {
            latitude: baseLatitude + (Math.random() * 0.0001),
            longitude: baseLongitude + (Math.random() * 0.0001),
            address: `${location}, Chandigarh University`
          }
        });
        umbrellaCounter++;
      }
    });
  });
  
  return umbrellas;
};

const sampleUmbrellas = generateUmbrellas();
const colors = ['red', 'blue', 'yellow', 'black', 'green'];
const locations = [
  'Main Gate', 'Central Library', 'Engineering Block', 'Student Activity Center', 'Boys Hostel',
  'Food Court', 'Sports Complex', 'Administrative Block', 'Girls Hostel', 'Medical Center',
  'Computer Science Block', 'Main Auditorium', 'Parking Area', 'Faculty Residence', 'Business School'
];

const sampleUsers = [
  {
    email: 'student1@cu.edu.in',
    phone: '9876543210',
    password: 'password123',
    walletBalance: 450,
    depositMade: true,
    cashbackReceived: true
  },
  {
    email: 'student2@cu.edu.in', 
    phone: '9876543211',
    password: 'password123',
    walletBalance: 280,
    depositMade: true,
    cashbackReceived: true
  },
  {
    email: 'student3@cu.edu.in',
    phone: '9876543212', 
    password: 'password123',
    walletBalance: 520,
    depositMade: true,
    cashbackReceived: true
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing data
    await Promise.all([
      Umbrella.deleteMany({}),
      User.deleteMany({}),
      Rental.deleteMany({}),
      Transaction.deleteMany({})
    ]);
    
    // Insert umbrellas
    const umbrellas = await Umbrella.insertMany(sampleUmbrellas);
    
    // Create users one by one to trigger pre-save middleware
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
    }
    
    // Create sample transactions
    const transactions = [];
    users.forEach(user => {
      transactions.push(
        { user: user._id, type: 'deposit', amount: 300, description: 'Initial deposit' },
        { user: user._id, type: 'cashback', amount: 100, description: 'First deposit cashback' },
        { user: user._id, type: 'deposit', amount: 500, description: 'Second deposit via UPI' },
        { user: user._id, type: 'rental', amount: -21, description: 'Umbrella rental payment' },
        { user: user._id, type: 'deposit', amount: 200, description: 'Top-up via Card' },
        { user: user._id, type: 'rental', amount: -35, description: 'Extended rental payment' }
      );
    });
    await Transaction.insertMany(transactions);
    
    // Create sample rental history
    const rentals = [
      {
        user: users[0]._id,
        umbrella: umbrellas[0]._id,
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        duration: 3,
        totalAmount: 21,
        paymentStatus: 'completed',
        isActive: false
      },
      {
        user: users[1]._id,
        umbrella: umbrellas[1]._id,
        startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        duration: 5,
        totalAmount: 35,
        paymentStatus: 'completed',
        isActive: false
      },
      {
        user: users[2]._id,
        umbrella: umbrellas[2]._id,
        startTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        duration: 8,
        totalAmount: 70,
        paymentStatus: 'completed',
        isActive: false
      }
    ];
    
    const createdRentals = await Rental.insertMany(rentals);
    
    // Update users with rental history
    await User.findByIdAndUpdate(users[0]._id, { $push: { rentalHistory: createdRentals[0]._id } });
    await User.findByIdAndUpdate(users[1]._id, { $push: { rentalHistory: createdRentals[1]._id } });
    await User.findByIdAndUpdate(users[2]._id, { $push: { rentalHistory: createdRentals[2]._id } });
    
    // Add rental transactions
    const rentalTransactions = [
      { user: users[0]._id, type: 'rental', amount: -21, description: `Rental for ${umbrellas[0].umbrellaId}` },
      { user: users[1]._id, type: 'rental', amount: -35, description: `Rental for ${umbrellas[1].umbrellaId}` },
      { user: users[2]._id, type: 'rental', amount: -70, description: `Rental for ${umbrellas[2].umbrellaId}` }
    ];
    await Transaction.insertMany(rentalTransactions);
    
    console.log('✅ Database seeded successfully!');
    console.log(`📊 Added ${umbrellas.length} umbrellas (3 of each color per location) across Chandigarh University campus`);
    console.log(`🎨 Colors: ${colors.length} | 📍 Locations: ${locations.length} | 🔢 Total: ${locations.length * colors.length * 3}`);
    console.log(`👥 Added ${users.length} sample users with rental history`);
    console.log(`📋 Added ${createdRentals.length} rental records`);
    console.log(`💳 Added ${transactions.length + rentalTransactions.length} transactions`);
    console.log('📊 Transaction breakdown: deposits, cashbacks, rentals, and top-ups');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();