const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

const connectDB = async () => {
  try {
    console.log("DEBUG: Loading MONGO_URI...");
    console.log("DEBUG: env.MONGO_URI is:", process.env.MONGO_URI ? "Defined (length: " + process.env.MONGO_URI.length + ")" : "Undefined");
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/frontier_erp';
    console.log("DEBUG: Using URI:", uri.replace(/:[^:]*@/, ':****@')); // Mask password

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`\u2705 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\u274c MongoDB connection error: ${error.message}`);
    isConnected = false;
    // Don't crash the server — allow health check to report the issue
    // Retry logic can be added here if needed
  }
};

// Handle MongoDB disconnection events
mongoose.connection.on('disconnected', () => {
  console.warn('\u26a0\ufe0f MongoDB disconnected. Attempting to reconnect...');
  isConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('\u2705 MongoDB reconnected successfully');
  isConnected = true;
});

const initDB = async () => {
  console.log('\ud83d\udd04 MongoDB initializing (Schema validation handled by Mongoose)');
  await connectDB();
};

const getConnectionStatus = () => isConnected;

module.exports = { initDB, connectDB, getConnectionStatus };