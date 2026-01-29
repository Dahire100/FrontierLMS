const mongoose = require('mongoose');
const User = require('../models/User');
const School = require('../models/School');
require('dotenv').config();

// Test users for all roles
const TEST_USERS = [
  {
    email: 'admin@schoolname.com',
    role: 'school_admin',
    firstName: 'School',
    lastName: 'Admin',
    isActive: true
  },
  {
    email: 'teacher@schoolname.com',
    role: 'teacher',
    firstName: 'Test',
    lastName: 'Teacher',
    isActive: true
  },
  {
    email: 'parent@example.com',
    role: 'parent',
    firstName: 'Test',
    lastName: 'Parent',
    isActive: true
  },
  {
    email: 'student@schoolname.com',
    role: 'student',
    firstName: 'Test',
    lastName: 'Student',
    isActive: true
  }
];

async function createTestUsers() {
  try {
    // Connect to MongoDB using environment variable
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/school_erp';
    await mongoose.connect(mongoUri);
    console.log('📦 Connected to MongoDB');

    // Create a test school if needed
    let testSchool = await School.findOne({ email: 'test@school.com' });
    if (!testSchool) {
      testSchool = await School.create({
        schoolName: 'Test School',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        pinCode: '123456',
        contactNumber: '1234567890',
        email: 'test@school.com',
        principalName: 'Test Principal',
        principalEmail: 'principal@test.com',
        principalPhone: '9876543210',
        schoolType: 'Private',
        boardType: 'CBSE',
        establishmentYear: '2020',
        description: 'Test school for development purposes',
        status: 'approved',
        adminEmail: 'admin@schoolname.com'
      });
      console.log('🏫 Test school created');
    }

    // Create test users
    for (const userData of TEST_USERS) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`ℹ️  User already exists: ${userData.email} (${userData.role})`);
      } else {
        const newUser = await User.create({
          ...userData,
          schoolId: testSchool._id,
          passwordHash: 'not-used-otp-only' // Placeholder since we use OTP
        });
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      }
    }

    console.log('\n✨ Test users creation completed!');
    console.log('\n📋 Available Test Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Super Admin: superadmin@frontierlms.com');
    console.log('2. School Admin: admin@schoolname.com');
    console.log('3. Teacher:      teacher@schoolname.com');
    console.log('4. Parent:       parent@example.com');
    console.log('5. Student:      student@schoolname.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔐 All accounts use OTP authentication');
    console.log('💡 In dev mode, OTP will be displayed in console\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();
