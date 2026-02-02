const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../src/models/User');

const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/frontier_erp';

const checkAdmins = async () => {
    try {
        await mongoose.connect(dbUri);
        console.log('✅ Connected to MongoDB');

        const admins = await User.find({ role: 'super_admin' });

        if (admins.length === 0) {
            console.log('❌ No super_admin found.');
        } else {
            console.log(`✅ Found ${admins.length} super_admin(s):`);
            admins.forEach(admin => {
                console.log(`- Email: ${admin.email}, Name: ${admin.firstName} ${admin.lastName}, Active: ${admin.isActive}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

checkAdmins();
