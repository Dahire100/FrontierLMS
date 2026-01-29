const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function checkIds() {
    try {
        const mongoUri = process.env.MONGO_URI;
        await mongoose.connect(mongoUri);

        const students = await User.find({ role: 'student' }).limit(3);
        console.log('Sample Students:', JSON.stringify(students.map(s => ({ email: s.email, schoolId: s.schoolId })), null, 2));

        const admins = await User.find({ role: 'school_admin' }).limit(3);
        console.log('Sample Admins:', JSON.stringify(admins.map(s => ({ email: s.email, schoolId: s.schoolId })), null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkIds();
