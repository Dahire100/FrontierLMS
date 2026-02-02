// controllers/schoolRegistrationController.js
const School = require('../models/School');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendSchoolRegistrationEmail, sendSchoolApprovalEmail, sendSuperAdminNotification } = require('../utils/emailService');

// Helper function to generate random password
function generateRandomPassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char

  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Register a new school (PUBLIC)
exports.registerSchool = async (req, res) => {
  try {
    const {
      schoolName, email, contactNumber, schoolType, type, boardType,
      establishmentYear, address, city, state, country, pinCode,
      principalName, principalEmail, principalPhone, description,
      totalStudents, totalTeachers, logo
    } = req.body; // or req.file if multipart, but sticking to body for now if it's base64 or url

    console.log('📝 School registration attempt:', { schoolName, email });

    // Enhanced validation
    if (!schoolName || !email) {
      return res.status(400).json({
        success: false,
        error: 'School name and email are required'
      });
    }

    if (!principalName || !principalEmail) {
      return res.status(400).json({
        success: false,
        error: 'Principal name and email are required'
      });
    }

    // Check if email already exists
    const existingSchool = await School.findOne({ email });

    if (existingSchool) {
      console.log('❌ School email already exists:', email, 'Status:', existingSchool.status);
      return res.status(400).json({
        success: false,
        error: `School with email ${email} already exists (Status: ${existingSchool.status})`
      });
    }

    // Create new school registration
    const newSchool = new School({
      schoolName, email, contactNumber, schoolType, type, boardType,
      establishmentYear, address, city, state, country, pinCode,
      principalName, principalEmail, principalPhone, description,
      totalStudents, totalTeachers, logo,
      status: 'pending'
    });

    await newSchool.save();

    console.log('✅ School registration successful!', {
      id: newSchool._id,
      schoolName,
      email
    });

    // Send registration confirmation email to school
    try {
      await sendSchoolRegistrationEmail(email, schoolName);
      console.log('📧 Confirmation email sent to school:', email);
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email to school:', emailError);
    }

    // Send notification to super admins
    try {
      const superAdmins = await User.find({ role: 'super_admin', isActive: true });
      console.log(`📧 Notifying ${superAdmins.length} super admins about new registration`);

      const notificationPromises = superAdmins.map(async (admin) => {
        try {
          await sendSuperAdminNotification(admin.email, newSchool);
          console.log(`✅ Notification sent to super admin: ${admin.email}`);
          return true;
        } catch (notifyError) {
          console.error(`❌ Failed to notify super admin ${admin.email}:`, notifyError.message);
          return false;
        }
      });

      await Promise.all(notificationPromises);
    } catch (notificationError) {
      console.error('❌ Super admin notification process failed:', notificationError);
    }

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully! Our team will review and contact you within 24-48 hours.',
      data: {
        registrationId: newSchool._id,
        schoolName: schoolName,
        email: email
      }
    });

  } catch (error) {
    console.error('❌ Unexpected registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed due to unexpected error.',
      details: error.message
    });
  }
};

// Get all pending registrations (SUPER ADMIN ONLY)
exports.getPendingRegistrations = async (req, res) => {
  console.log('📋 Fetching pending registrations...');

  try {
    const pendingSchools = await School.find({ status: 'pending' }).sort({ createdAt: -1 });

    console.log(`✅ Found ${pendingSchools.length} pending registrations`);
    res.json({
      success: true,
      schools: pendingSchools,
      count: pendingSchools.length
    });
  } catch (err) {
    console.error('❌ Error fetching pending registrations:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch pending registrations'
    });
  }
};

// Get all registrations (SUPER ADMIN ONLY)
exports.getAllRegistrations = async (req, res) => {
  console.log('📋 Fetching all registrations...');

  try {
    const schools = await School.find().sort({ createdAt: -1 });

    console.log(`✅ Found ${schools.length} total registrations`);
    res.json({
      success: true,
      schools: schools,
      count: schools.length
    });
  } catch (err) {
    console.error('❌ Error fetching all registrations:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch registrations'
    });
  }
};

// Get all active schools (PUBLIC)
exports.getActiveSchools = async (req, res) => {
  try {
    const schools = await School.find({ status: 'approved' })
      .select('schoolName city state _id')
      .sort({ schoolName: 1 });

    res.json({
      success: true,
      schools: schools
    });
  } catch (err) {
    console.error('❌ Error fetching active schools:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch schools'
    });
  }
};

// Approve registration with manual credentials (SUPER ADMIN ONLY)
exports.approveRegistration = async (req, res) => {
  try {
    const { registrationId, adminEmail, adminPassword } = req.body;

    console.log('✅ Approval request:', { registrationId, adminEmail });

    if (!registrationId || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        error: 'Registration ID, admin email, and password are required'
      });
    }

    const school = await School.findById(registrationId);

    if (!school) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    if (school.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Registration is already ${school.status}`
      });
    }

    const existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Admin email already exists. Please use a different email.'
      });
    }

    const hashedPassword = bcrypt.hashSync(adminPassword, 10);

    school.status = 'approved';
    school.adminEmail = adminEmail;
    school.adminPassword = hashedPassword;
    await school.save();

    // Generate username using School Name + Random Number
    const usernameStub = school.schoolName.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 10);
    const randomNumber = Math.floor(100000 + Math.random() * 900000); // 6 digit number
    const adminUsername = `${usernameStub}${randomNumber}`;

    const newUser = await User.create({
      email: adminEmail,
      username: adminUsername,
      passwordHash: hashedPassword,
      role: 'school_admin',
      firstName: school.principalName.split(' ')[0] || 'School',
      lastName: school.principalName.split(' ').slice(1).join(' ') || 'Admin',
      schoolId: school._id,
      isActive: true,
      phone: school.principalPhone
    });

    try {
      // Use generic email service for consistent branding
      const { sendEmail } = require('../utils/emailService');
      await sendEmail({
        to: adminEmail,
        subject: 'Registration Approved - Frontier LMS Admin Access',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6610f2;">Welcome to Frontier LMS</h2>
                <h3 style="color: #333;">${school.schoolName} Registration Approved!</h3>
                <p>Hello Admin,</p>
                <p>Your school registration has been approved. You can now access your administrative dashboard.</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #6610f2;">
                    <p><strong>Admin Username:</strong> ${adminUsername}</p>
                    <p><strong>Password:</strong> ${adminPassword}</p>
                </div>
                <p style="color: #dc3545; font-size: 0.9em;">* Please change your password immediately after logging in.</p>
                <p><a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background-color: #6610f2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Login to Dashboard</a></p>
            </div>
          `
      });

      res.json({
        success: true,
        message: 'School approved successfully! Login credentials have been sent to the school.',
        data: {
          schoolId: school._id,
          schoolName: school.schoolName,
          adminEmail: adminEmail,
          adminUserId: newUser._id
        }
      });
    } catch (emailError) {
      res.json({
        success: true,
        message: 'School approved but email failed to send.',
        warning: 'Please manually send credentials to the school.',
        data: {
          schoolId: school._id,
          schoolName: school.schoolName,
          adminEmail: adminEmail,
          adminPassword: adminPassword,
          adminUserId: newUser._id
        }
      });
    }
  } catch (error) {
    console.error('❌ Unexpected approval error:', error);
    res.status(500).json({
      success: false,
      error: 'Approval process failed due to unexpected error',
      details: error.message
    });
  }
};

// Reject registration (SUPER ADMIN ONLY)
exports.rejectRegistration = async (req, res) => {
  const { registrationId, reason } = req.body;

  if (!registrationId) {
    return res.status(400).json({
      success: false,
      error: 'Registration ID is required'
    });
  }

  try {
    const school = await School.findByIdAndUpdate(
      registrationId,
      { status: 'rejected' },
      { new: true }
    );

    if (!school) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    // Send rejection email
    try {
      const { sendEmail } = require('../utils/emailService');
      await sendEmail({
        to: school.email,
        subject: 'Registration Update - Frontier LMS',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc3545;">Registration Rejected</h2>
                <p>Dear ${school.principalName || 'Principal'},</p>
                <p>We regret to inform you that your registration for <strong>${school.schoolName}</strong> has been rejected.</p>
                ${reason ? `<div style="background-color: #fff3f3; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;"><p><strong>Reason:</strong> ${reason}</p></div>` : ''}
                <p>If you believe this is a mistake or would like to appeal, please reply to this email.</p>
            </div>
        `
      });
      console.log(`📧 Rejection email sent to ${school.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send rejection email:', emailError);
    }

    res.json({
      success: true,
      message: reason ? `Registration rejected: ${reason}` : 'Registration rejected',
      data: {
        registrationId: registrationId,
        schoolName: school.schoolName,
        email: school.email
      }
    });
  } catch (err) {
    console.error('❌ Rejection database error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to reject registration'
    });
  }
};

// Auto-approve school registration (SUPER ADMIN ONLY)
// This function auto-generates credentials and sends them via email
exports.autoApproveSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    console.log('✅ Auto-approval request for school:', schoolId);

    const school = await School.findById(schoolId);

    if (!school) {
      console.log('❌ School not found:', schoolId);
      return res.status(404).json({
        success: false,
        error: 'School not found'
      });
    }

    if (school.status !== 'pending') {
      console.log('❌ School already processed:', school.status);
      return res.status(400).json({
        success: false,
        error: `School is already ${school.status}`
      });
    }

    // Auto-generate admin email and password
    const adminEmail = school.principalEmail || school.email;
    const adminPassword = generateRandomPassword(12);

    console.log('🔑 Generated credentials:', { adminEmail, password: adminPassword });

    // Check if admin email already exists
    const existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      console.log('❌ Admin email already exists:', adminEmail);
      return res.status(400).json({
        success: false,
        error: 'Admin email already exists. Please contact support.'
      });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);

    // Update school status
    school.status = 'approved';
    school.adminEmail = adminEmail;
    school.adminPassword = hashedPassword;
    await school.save();

    console.log('✅ School status updated to approved:', school.schoolName);

    // Generate username using School Name + Random Number
    const usernameStub = school.schoolName.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 10);
    const randomNumber = Math.floor(100000 + Math.random() * 900000); // 6 digit number
    const adminUsername = `${usernameStub}${randomNumber}`;

    // Create school admin user
    const newUser = await User.create({
      email: adminEmail,
      username: adminUsername,
      passwordHash: hashedPassword,
      role: 'school_admin',
      firstName: school.principalName.split(' ')[0] || 'School',
      lastName: school.principalName.split(' ').slice(1).join(' ') || 'Admin',
      schoolId: school._id,
      isActive: true,
      phone: school.principalPhone || school.contactNumber
    });

    console.log('✅ School admin user created:', {
      userId: newUser._id,
      email: adminEmail,
      school: school.schoolName
    });

    // Send approval email with credentials
    try {
      console.log('📧 Sending approval email with credentials to:', adminEmail);
      const { sendEmail } = require('../utils/emailService');
      await sendEmail({
        to: adminEmail,
        subject: 'Registration Approved - Frontier LMS Admin Access',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6610f2;">Welcome to Frontier LMS</h2>
                <h3 style="color: #333;">${school.schoolName} Registration Approved!</h3>
                <p>Hello Admin,</p>
                <p>Your school registration has been automatically approved. You can now access your administrative dashboard.</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #6610f2;">
                    <p><strong>Admin Username:</strong> ${adminUsername}</p>
                    <p><strong>Password:</strong> ${adminPassword}</p>
                </div>
                <p style="color: #dc3545; font-size: 0.9em;">* Please change your password immediately after logging in.</p>
                <p><a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background-color: #6610f2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Login to Dashboard</a></p>
            </div>
          `
      });
      console.log('✅ Approval email sent to:', adminEmail);

      res.json({
        success: true,
        message: 'School approved successfully! Login credentials have been sent via email.',
        data: {
          schoolId: school._id,
          schoolName: school.schoolName,
          adminEmail: adminEmail,
          adminPassword: adminPassword, // return password for UI display
          adminUserId: newUser._id,
          loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
        }
      });

    } catch (emailError) {
      console.error('❌ Failed to send approval email:', emailError);

      // Still return success but include credentials in response
      res.json({
        success: true,
        message: 'School approved but email failed to send. Please share credentials manually.',
        warning: 'Email service not configured',
        data: {
          schoolId: school._id,
          schoolName: school.schoolName,
          adminEmail: adminEmail,
          adminPassword: adminPassword,
          adminUserId: newUser._id,
          loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
        }
      });
    }
  } catch (error) {
    console.error('❌ Unexpected approval error:', error);
    res.status(500).json({
      success: false,
      error: 'Approval process failed due to unexpected error',
      details: error.message
    });
  }
};

// Auto-reject school registration (SUPER ADMIN ONLY)
exports.autoRejectSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { reason } = req.body;

    console.log('❌ Auto-rejection request:', { schoolId, reason });

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required'
      });
    }

    const school = await School.findById(schoolId);

    if (!school) {
      console.log('❌ School not found for rejection:', schoolId);
      return res.status(404).json({
        success: false,
        error: 'School not found'
      });
    }

    if (school.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `School is already ${school.status}`
      });
    }

    // Update school status to rejected
    school.status = 'rejected';
    school.rejectionReason = reason || 'Not specified';
    school.rejectedAt = new Date();
    await school.save();

    console.log('✅ School registration rejected:', schoolId);

    // Send rejection email
    try {
      const { sendEmail } = require('../utils/emailService');
      await sendEmail({
        to: school.email,
        subject: 'Registration Update - Frontier LMS',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc3545;">Registration Rejected</h2>
                <p>Dear ${school.principalName || 'Principal'},</p>
                <p>We regret to inform you that your registration for <strong>${school.schoolName}</strong> has been rejected.</p>
                ${reason ? `<div style="background-color: #fff3f3; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;"><p><strong>Reason:</strong> ${reason}</p></div>` : ''}
                <p>If you believe this is a mistake or would like to appeal, please reply to this email.</p>
            </div>
        `
      });
      console.log(`📧 Rejection email sent to ${school.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send rejection email:', emailError);
    }

    res.json({
      success: true,
      message: reason ? `Registration rejected: ${reason}` : 'Registration rejected',
      data: {
        schoolId: schoolId,
        schoolName: school.schoolName,
        email: school.email,
        rejectedAt: school.rejectedAt
      }
    });
  } catch (err) {
    console.error('❌ Rejection error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to reject registration',
      details: err.message
    });
  }
};

// Update school status (Suspend/Activate)
exports.updateSchoolStatus = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { status } = req.body;

    if (!['approved', 'suspended', 'active'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const school = await School.findByIdAndUpdate(
      schoolId,
      { status },
      { new: true }
    );

    if (!school) {
      return res.status(404).json({
        success: false,
        error: 'School not found'
      });
    }

    res.json({
      success: true,
      message: `School status updated to ${status}`,
      school
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get public school info by slug/ID (Public Access)
exports.getSchoolPublicInfo = async (req, res) => {
  try {
    const { slug } = req.params;
    const mongoose = require('mongoose');

    let school = null;

    if (mongoose.Types.ObjectId.isValid(slug)) {
      school = await School.findById(slug).select('schoolName logo city state email');
    }

    if (!school) {
      // Resolve slug logic
      const normalize = (value) => (value || '').toString().trim().toLowerCase();
      const toSlug = (value) => normalize(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      const schools = await School.find({}, { schoolName: 1, logo: 1, city: 1, state: 1, email: 1 });
      const incomingSlug = toSlug(slug);

      school = schools.find((s) => {
        const slugName = toSlug(s.schoolName);
        return slugName === incomingSlug;
      });
    }

    if (!school) {
      return res.status(404).json({
        success: false,
        error: 'School not found'
      });
    }

    res.json({
      success: true,
      school: {
        _id: school._id,
        schoolName: school.schoolName,
        logo: school.logo,
        city: school.city,
        state: school.state
      }
    });

  } catch (error) {
    console.error('Error fetching public school info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch school info'
    });
  }
};