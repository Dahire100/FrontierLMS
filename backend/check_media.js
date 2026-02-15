const mongoose = require('mongoose');
const Media = require('./src/models/Media');
const User = require('./src/models/User');
require('dotenv').config();
const { initDB } = require('./src/config/db');

async function checkMedia() {
    await initDB();

    console.log('--- Debugging Media ---');

    const schoolAdmins = await User.find({ role: 'school_admin', isActive: true });

    for (const admin of schoolAdmins) {
        if (admin.schoolId) {
            console.log(`Checking media for Admin: ${admin.firstName} (${admin.email}) - School: ${admin.schoolId}`);
            const count = await Media.countDocuments({ schoolId: admin.schoolId });
            console.log(`  -> Count: ${count}`);

            if (count > 0) {
                const items = await Media.find({ schoolId: admin.schoolId }).sort({ createdAt: -1 }).limit(3);
                items.forEach(item => {
                    console.log(`    - [${item.type}] ${item.name} (${item.url})`);
                });
            }
        }
    }

    console.log('--- End Debug ---');
    process.exit();
}

checkMedia();
