const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/frontier_erp', {
      // These options are no longer needed in Mongoose 6+, but keeping for reference if using older versions
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Placeholder for initDB to maintain compatibility with server.js calls
// In MongoDB, we don't need to explicitly create tables
const initDB = async () => {
  console.log('🔄 MongoDB initialized (Schema validation handled by Mongoose)');
  await connectDB();
};

// Export db object to maintain compatibility with existing controllers temporarily
// This allows us to migrate controllers one by one
const db = {
  // Helper to bridge SQLite calls to Mongoose during migration
  // This is a temporary shim
  get: () => { console.error('❌ db.get called - Migrate to Mongoose model!'); },
  run: () => { console.error('❌ db.run called - Migrate to Mongoose model!'); },
  all: () => { console.error('❌ db.all called - Migrate to Mongoose model!'); }
};

module.exports = { db, initDB, connectDB };