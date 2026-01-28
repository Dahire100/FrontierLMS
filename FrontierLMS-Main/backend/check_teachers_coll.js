const mongoose = require('mongoose');
const Teacher = require('./src/models/Teacher');
require('dotenv').config();

async function checkTeachers() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/frontier_erp';
        await mongoose.connect(mongoUri);

        const count = await Teacher.countDocuments();
        console.log('Total Teachers in Teacher collection:', count);

        const samples = await Teacher.find().limit(5);
        console.log('Sample teachers:', JSON.stringify(samples, null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTeachers();
