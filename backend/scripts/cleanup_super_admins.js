const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../src/models/User');

const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/frontier_erp';

const cleanupAdmins = async () => {
    try {
        await mongoose.connect(dbUri);
        console.log('✅ Connected to MongoDB');

        // Delete ALL super_admins EXCEPT devendrarahire20@gmail.com
        const targetEmail = 'devendrarahire20@gmail.com';

        const result = await User.deleteMany({
            role: 'super_admin',
            email: { $ne: targetEmail }
        });

        if (result.deletedCount > 0) {
            console.log(`✅ Successfully removed ${result.deletedCount} other super_admin(s).`);
        } else {
            console.log('ℹ️  No other super_admins found to remove.');
        }

        // Verify who is left
        const remainingAdmins = await User.find({ role: 'super_admin' });
        console.log('\n👑 Remaining Super Admins:');
        remainingAdmins.forEach(admin => {
            console.log(`- ${admin.email} (${admin.firstName} ${admin.lastName})`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

cleanupAdmins();
