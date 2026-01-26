// fixUserRoles.js - Run this to verify and fix user roles
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function fixUserRoles() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users and display their roles
    console.log('📋 Current Users in Database:');
    console.log('═'.repeat(80));

    const users = await User.find({}).select('email role firstName lastName isActive');

    if (users.length === 0) {
      console.log('⚠️  No users found in database!');
      process.exit(0);
    }

    users.forEach((user, index) => {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
      const status = user.isActive ? '✅ Active' : '❌ Inactive';
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${status}`);
      console.log('─'.repeat(80));
    });

    // Check for problematic roles
    console.log('\n🔍 Checking for Role Issues...\n');

    const validRoles = ['super_admin', 'school_admin', 'teacher', 'parent', 'student'];
    const invalidUsers = users.filter(user => !validRoles.includes(user.role));

    if (invalidUsers.length > 0) {
      console.log('⚠️  Found users with invalid roles:');
      invalidUsers.forEach(user => {
        console.log(`   - ${user.email}: "${user.role}" (should be one of: ${validRoles.join(', ')})`);
      });

      console.log('\n❌ Please update these manually in MongoDB or update the script');
    } else {
      console.log('✅ All user roles are valid!');
    }

    // Check for users with "admin" role (common mistake)
    console.log('\n🔍 Checking for common role mistakes...\n');

    const adminUsers = await User.find({ role: 'admin' });
    if (adminUsers.length > 0) {
      console.log('⚠️  Found users with role "admin" (should be "school_admin"):');
      adminUsers.forEach(user => {
        console.log(`   - ${user.email}`);
      });

      console.log('\n🔧 Fixing these users...');
      const result = await User.updateMany(
        { role: 'admin' },
        { $set: { role: 'school_admin' } }
      );
      console.log(`✅ Updated ${result.modifiedCount} users: "admin" → "school_admin"`);
    } else {
      console.log('✅ No users with incorrect "admin" role');
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log('═'.repeat(80));
    const roleCounts = {};
    users.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });

    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`${role}: ${count} user(s)`);
    });
    console.log('═'.repeat(80));

    console.log('\n✅ Role verification complete!');
    console.log('\n💡 Tip: If admin@schoolname.com exists, verify it has role "school_admin"');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUserRoles();
