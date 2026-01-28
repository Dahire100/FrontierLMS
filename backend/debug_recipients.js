const mongoose = require('mongoose');
const User = require('./src/models/User');
const Teacher = require('./src/models/Teacher');
const Staff = require('./src/models/Staff');
require('dotenv').config();

async function debugRecipients() {
    try {
        const mongoUri = process.env.MONGO_URI;
        await mongoose.connect(mongoUri);

        console.log('--- USER COLLECTION ---');
        const users = await User.find({ role: { $in: ['school_admin', 'teacher', 'admin', 'super_admin'] } }).select('email role schoolId firstName lastName');
        console.log(JSON.stringify(users, null, 2));

        console.log('--- TEACHER COLLECTION ---');
        const teachers = await Teacher.find().select('email schoolId firstName lastName');
        console.log(JSON.stringify(teachers, null, 2));

        console.log('--- STAFF COLLECTION ---');
        const staff = await Staff.find().select('email role schoolId firstName lastName');
        console.log(JSON.stringify(staff, null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugRecipients();
