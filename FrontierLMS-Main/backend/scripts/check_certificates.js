const mongoose = require('mongoose');
const Certificate = require('../src/models/Certificate');
require('dotenv').config();

const checkCertificates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/frontier_erp');
        console.log('Connected to MongoDB');

        const certs = await Certificate.find({});
        console.log(`Total Certificates found: ${certs.length}`);
        console.log(JSON.stringify(certs, null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkCertificates();
