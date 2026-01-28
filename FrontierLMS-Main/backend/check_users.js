const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function checkUsers() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/frontier_erp';
        console.log('Connecting to:', mongoUri);
        await mongoose.connect(mongoUri);

        const counts = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        console.log('Role counts:', JSON.stringify(counts, null, 2));

        const samples = await User.find({ role: { $in: ['teacher', 'school_admin'] } }).limit(5);
        console.log('Sample users:', JSON.stringify(samples, null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
