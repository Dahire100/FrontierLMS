const mongoose = require('mongoose');
const Event = require('./src/models/Event');
const User = require('./src/models/User');
const School = require('./src/models/School');
require('dotenv').config();

const { initDB } = require('./src/config/db');

async function checkEvents() {
    await initDB();

    // Find the user 'patil sir' to get their schoolId
    const user = await User.findOne({ email: 'admin@school.com' }); // Assuming this is the email, or I can search by name if unique
    // Better: List all users with role 'school_admin' to find the one.

    console.log('--- Debugging Events ---');

    const schoolAdmins = await User.find({ role: 'school_admin' }).lean();
    console.log(`Found ${schoolAdmins.length} school admins.`);

    for (const admin of schoolAdmins) {
        console.log(`Admin: ${admin.firstName} ${admin.lastName} (${admin.email}) - SchoolID: ${admin.schoolId} - Active: ${admin.isActive}`);
        if (admin.schoolId) {
            const events = await Event.countDocuments({ schoolId: admin.schoolId });
            console.log(`  -> Events found for this school: ${events}`);

            const actualEvents = await Event.find({ schoolId: admin.schoolId }).limit(2);
            console.log(`  -> Sample events:`, actualEvents);
        } else {
            console.log(`  -> No School ID associated!`);
        }
    }

    console.log('--- End Debug ---');
    process.exit();
}

checkEvents();
