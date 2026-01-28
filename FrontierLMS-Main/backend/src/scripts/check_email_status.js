require('dotenv').config();
const { verifyConfig } = require('../utils/emailService');

async function check() {
    console.log('--- Email Configuration Check ---');
    console.log('SMTP_HOST:', process.env.SMTP_HOST ? 'Set' : 'Missing');
    console.log('SMTP_USER:', process.env.SMTP_USER ? 'Set' : 'Missing');
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'Set' : 'Missing');

    console.log('\n--- Connection Test ---');
    // verifyConfig logs errors to console.error, so watch the output above
    const result = await verifyConfig();
    if (result) {
        console.log('✅ Email System is WORKING');
    } else {
        console.log('❌ Email System is NOT WORKING');
        console.log('👉 TIP: If using Gmail, ensure you are using an "App Password", not your login password.');
    }
    process.exit(0);
}

check();
