const bcrypt = require('bcryptjs');
const User = require('../models/User');
const School = require('../models/School');

// HARDCODED SUPER ADMIN CREDENTIALS - DO NOT CHANGE
// These credentials are secured and cannot be modified through the application
const SUPER_ADMIN_CREDENTIALS = {
    email: 'superadmin@frontierlms.com',
    password: 'FrontierLMS@2025!SuperAdmin', // Strong password
    firstName: 'System',
    lastName: 'Administrator'
};

const seedDatabase = async () => {
    try {
        console.log('🌱 Seeding database...');

        // Always ensure super admin exists with hardcoded credentials
        const superAdminEmail = SUPER_ADMIN_CREDENTIALS.email;
        let existingAdmin = await User.findOne({ email: superAdminEmail });

        const hashedPassword = await bcrypt.hash(SUPER_ADMIN_CREDENTIALS.password, 10);

        if (!existingAdmin) {
            await User.create({
                email: SUPER_ADMIN_CREDENTIALS.email,
                passwordHash: hashedPassword,
                role: 'super_admin',
                firstName: SUPER_ADMIN_CREDENTIALS.firstName,
                lastName: SUPER_ADMIN_CREDENTIALS.lastName,
                isActive: true,
                canChangePassword: false // Prevent password changes
            });

            console.log('✅ Super admin created with secure credentials');
            console.log('🔐 Super Admin Email:', SUPER_ADMIN_CREDENTIALS.email);
        } else {
            // Update password hash to ensure it matches hardcoded password
            existingAdmin.passwordHash = hashedPassword;
            existingAdmin.role = 'super_admin';
            existingAdmin.isActive = true;
            existingAdmin.canChangePassword = false;
            await existingAdmin.save();

            console.log('ℹ️  Super admin credentials synchronized');
        }

        console.log('✨ Database seeding completed');
        console.log('\n🔐 SUPER ADMIN LOGIN:');
        console.log('   Email:', SUPER_ADMIN_CREDENTIALS.email);
        console.log('   Password: [Secured - Check seed.js file]');
        console.log('   Note: OTP will be sent to this email for login\n');

          // Create sample schools if none exist
  const schoolCount = await School.countDocuments();
  if (schoolCount === 0) {
    const sampleSchools = [
      {
        name: 'Frontier Public School',
        address: '123 Education Street, City',
        phone: '+1234567890',
        email: 'contact@frontierschool.com',
        principalName: 'Dr. John Smith',
        status: 'active'
      },
      {
        name: 'Excellence Academy',
        address: '456 Learning Avenue, City',
        phone: '+9876543210',
        email: 'info@excellenceacademy.com',
        principalName: 'Ms. Sarah Johnson',
        status: 'active'
      },
      {
        name: 'Global Institute',
        address: '789 Knowledge Lane, City',
        phone: '+5555555555',
        email: 'hello@globalinstitute.com',
        principalName: 'Prof. Michael Brown',
        status: 'active'
      }
    ];
    await School.insertMany(sampleSchools);
    console.log('✅ Sample schools created successfully');
  }
    } catch (error) {
        console.error('❌ Seeding error:', error);
    }
};

module.exports = { seedDatabase, SUPER_ADMIN_CREDENTIALS };
