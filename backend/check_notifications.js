const mongoose = require('mongoose');
const Notification = require('./src/models/Notification');
const User = require('./src/models/User');
require('dotenv').config();

async function checkNotifications() {
    try {
        const mongoUri = process.env.MONGO_URI;
        await mongoose.connect(mongoUri);

        // Find patil sir
        const user = await User.findOne({ lastName: 'sir' }); // Looking for "patil sir"
        if (!user) {
            console.log('User patil sir not found');
            // Let's just look for any notification
        } else {
            console.log(`Found user: ${user.email} (ID: ${user._id})`);
            const count = await Notification.countDocuments({ recipient: user._id });
            console.log(`Notification count for ${user.email}: ${count}`);
        }

        const allCount = await Notification.countDocuments();
        console.log(`Total notifications in DB: ${allCount}`);

        const latest = await Notification.find().sort({ createdAt: -1 }).limit(5);
        console.log('Latest 5 notifications:', JSON.stringify(latest, null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkNotifications();
