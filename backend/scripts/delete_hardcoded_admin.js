const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load .env from backend root
const User = require('../src/models/User');

const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/frontier_erp';

const deleteAdmin = async () => {
    try {
        await mongoose.connect(dbUri);
        console.log('✅ Connected to MongoDB');

        const email = 'superadmin@frontierlms.com';
        const result = await User.deleteOne({ email: email });

        if (result.deletedCount > 0) {
            console.log(`✅ Successfully deleted user with email: ${email}`);
        } else {
            console.log(`ℹ️  No user found with email: ${email}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

deleteAdmin();
