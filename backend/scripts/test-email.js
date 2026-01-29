const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sendSchoolApprovalEmail } = require('../src/utils/emailService');

const testEmail = async () => {
    console.log('🧪 Testing Email Service...');
    console.log(`Checking Env: HOST=${process.env.SMTP_HOST}, USER=${process.env.SMTP_USER}`);

    // Simulate approval email
    try {
        const result = await sendSchoolApprovalEmail(
            process.env.SUPER_ADMIN_EMAIL || process.env.SMTP_USER, // Send to self
            'Test School',
            'test_admin@frontier.com',
            'test_password_123'
        );
        console.log('✅ Test Email Result:', result);
    } catch (error) {
        console.error('❌ Test Email Failed:', error);
    }
};

testEmail();
