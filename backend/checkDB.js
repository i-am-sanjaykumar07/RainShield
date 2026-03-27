const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections:');
    
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`  - ${col.name}: ${count} documents`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabase();
