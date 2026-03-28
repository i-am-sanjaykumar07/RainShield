require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const ADMIN_EMAIL = 'palisettysanjaykumar@gmail.com';
const DEPOSIT_AMOUNT = 300;
const CASHBACK_AMOUNT = 100;

async function addAdminDeposit() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.\n');

    const admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      console.error(`❌ Admin user "${ADMIN_EMAIL}" not found. Please register first.`);
      process.exit(1);
    }

    // Apply deposit + cashback
    admin.walletBalance += DEPOSIT_AMOUNT + CASHBACK_AMOUNT; // 300 + 100 = 400
    admin.depositMade = true;
    admin.depositAmount = 100;      // ₹100 refundable security deposit held
    admin.cashbackReceived = true;
    await admin.save();

    // Record deposit transaction
    await new Transaction({
      user: admin._id,
      type: 'deposit',
      amount: DEPOSIT_AMOUNT,
      description: 'Admin wallet deposit (manual)',
      status: 'completed'
    }).save();

    // Record cashback transaction
    await new Transaction({
      user: admin._id,
      type: 'cashback',
      amount: CASHBACK_AMOUNT,
      description: 'First deposit cashback (₹300+ deposit)',
      status: 'completed'
    }).save();

    console.log(`👑 Admin: ${admin.email}`);
    console.log(`💰 Deposited:  ₹${DEPOSIT_AMOUNT}`);
    console.log(`🎁 Cashback:   ₹${CASHBACK_AMOUNT}`);
    console.log(`💳 New Balance: ₹${admin.walletBalance}`);
    console.log(`\n✅ Done! Admin account is now active and ready to rent.\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

addAdminDeposit();
