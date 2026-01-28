const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const School = require('../models/School');
const User = require('../models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/frontier_erp');
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const verify = async () => {
    await connectDB();

    const schoolCount = await School.countDocuments();
    const userCount = await User.countDocuments();

    console.log(`🏫 Schools: ${schoolCount}`);
    console.log(`👤 Users: ${userCount}`);

    process.exit(0);
};

verify();
