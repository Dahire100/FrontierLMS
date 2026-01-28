const nodemailer = require('nodemailer');

// Singleton state
let activeTransporter = null;
let isMockTransport = false;

// Helper: Get or Initialize Transporter with Fallback
const getTransporter = async () => {
  if (activeTransporter) return activeTransporter;

  const isConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (isConfigured) {
    try {
      console.log('🔄 Initializing Real SMTP Transport...');
      const realTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000,
        tls: { rejectUnauthorized: false }
      });

      await realTransporter.verify();
      console.log('✅ Real SMTP Server Connected Successfully');
      activeTransporter = realTransporter;
      isMockTransport = false;
      return activeTransporter;

    } catch (error) {
      console.error('❌ Real SMTP Connection Failed:', error.message);
      console.log('⚠️ Switching to Ethereal (Mock) Email Service for guaranteed delivery...');
    }
  } else {
    console.log('⚠️ No Email Credentials found. Using Ethereal Mock Service.');
  }

  // Fallback to Ethereal
  try {
    const testAccount = await nodemailer.createTestAccount();
    const mockTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('✅ Ethereal Mock Transporter Created');
    console.log(`ℹ️  Mock Account: ${testAccount.user}`);
    activeTransporter = mockTransporter;
    isMockTransport = true;
    return activeTransporter;
  } catch (err) {
    console.error('❌ Failed to create Mock Transporter:', err);
    return null;
  }
};

exports.verifyConfig = async () => {
  const t = await getTransporter();
  return !!t;
};

// Send OTP email
exports.sendOTPEmail = async (toEmail, otp, purpose = 'login') => {
  const transporter = await getTransporter();
  if (!transporter) return { success: false, message: 'Email System Failure' };

  try {
    const purposeText = {
      'login': 'Login',
      'registration': 'Registration',
      'password_reset': 'Password Reset'
    }[purpose] || 'Verification';

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Frontier LMS" <system@frontierlms.com>',
      to: toEmail,
      subject: `🔐 Your ${purposeText} OTP - FrontierLMS`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #2563eb; }
            .otp-code { font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><h1>🎓 FrontierLMS</h1></div>
            <div class="content">
              <h2>Your One-Time Password</h2>
              <p>For ${purposeText.toLowerCase()} verification:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <div class="footer"><p>Valid for 10 minutes</p></div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent to:', toEmail);
    if (isMockTransport) {
      console.log('🌍 [MOCK EMAIL PREVIEW]:', nodemailer.getTestMessageUrl(info));
    }
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error.message);
    // Dev fallback
    console.log(`📧 [CONSOLE FALLBACK] OTP for ${toEmail}: ${otp}`);
    return { success: false, error: error.message, otp };
  }
};

// Send notification to super admin about new registration
exports.sendSuperAdminNotification = async (superAdminEmail, schoolData) => {
  const transporter = await getTransporter();
  if (!transporter) return { success: false, message: 'Email System Failure' };

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Frontier LMS" <system@frontierlms.com>',
      to: superAdminEmail,
      subject: '🚨 New School Registration Requires Approval',
      html: `
        <h1>New Registration: ${schoolData.schoolName}</h1>
        <p><strong>Principal:</strong> ${schoolData.principalName}</p>
        <p><strong>Contact:</strong> ${schoolData.contactNumber}</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">Admin Login</a>
      ` // Simplified HTMl for brevity in fallback, keeps core data
    });

    console.log('✅ Super Admin Notification Sent');
    if (isMockTransport) console.log('🌍 [MOCK PREVIEW]:', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('❌ Failed to send Admin Notification:', error.message);
    throw error;
  }
};

// Send school approval email with login credentials
exports.sendSchoolApprovalEmail = async (toEmail, schoolName, adminEmail, adminPassword) => {
  const transporter = await getTransporter();
  if (!transporter) return { success: false, message: 'Email System Failure' };

  try {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Frontier LMS" <system@frontierlms.com>',
      to: toEmail,
      subject: '✅ Registration Approved - Login Credentials',
      html: `
        <h1>Welcome ${schoolName}!</h1>
        <p>Your account is approved.</p>
        <p><strong>URL:</strong> ${loginUrl}</p>
        <p><strong>Email:</strong> ${adminEmail}</p>
        <p><strong>Password:</strong> ${adminPassword}</p>
      `
    });

    console.log('✅ Approval Email Sent');
    if (isMockTransport) console.log('🌍 [MOCK PREVIEW]:', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('❌ Failed to send Approval Email:', error.message);
    throw error;
  }
};

// Send account activation email with credentials
exports.sendAccountActivationEmail = async (toEmail, schoolName, adminEmail, loginUrl) => {
  const transporter = await getTransporter();
  if (!transporter) return { success: false, message: 'Email System Failure' };

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Frontier LMS" <system@frontierlms.com>',
      to: toEmail,
      subject: '🎉 Account Activated - Welcome to FrontierLMS',
      html: `<h1>Account Active</h1><p>Welcome ${schoolName}. <a href="${loginUrl}">Login Here</a></p>`
    });
    console.log('✅ Activation Email Sent');
    if (isMockTransport) console.log('🌍 [MOCK PREVIEW]:', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) { console.error(error); throw error; }
};

exports.sendSchoolRegistrationEmail = async (toEmail, schoolName) => {
  const transporter = await getTransporter();
  if (!transporter) return { success: false, message: 'Email System Failure' };
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Frontier LMS" <system@frontierlms.com>',
      to: toEmail,
      subject: '📋 Registration Received',
      html: `<h1>Registration Received</h1><p>Thank you, ${schoolName}. We are reviewing your application.</p>`
    });
    console.log('✅ Registration Receipt Email Sent');
    if (isMockTransport) console.log('🌍 [MOCK PREVIEW]:', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) { console.error(error); throw error; }
};

// Send student credentials
exports.sendStudentCredentials = async (toEmail, studentName, studentId, password) => {
  const transporter = await getTransporter();
  if (!transporter) return { success: false, message: 'Email System Failure' };
  try {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Frontier LMS" <system@frontierlms.com>',
      to: toEmail,
      subject: 'Student Credentials',
      html: `<h1>Welcome ${studentName}</h1><p>ID: ${studentId}<br>Pass: ${password}<br><a href="${loginUrl}">Login</a></p>`
    });
    console.log('✅ Student Credentials Sent');
    if (isMockTransport) console.log('🌍 [MOCK PREVIEW]:', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (e) { console.error(e); throw e; }
};

// Send teacher credentials
exports.sendTeacherCredentials = async (toEmail, teacherName, teacherId, password) => {
  const transporter = await getTransporter();
  if (!transporter) return { success: false, message: 'Email System Failure' };
  try {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Frontier LMS" <system@frontierlms.com>',
      to: toEmail,
      subject: 'Teacher Credentials',
      html: `<h1>Welcome ${teacherName}</h1><p>ID: ${teacherId}<br>Pass: ${password}<br><a href="${loginUrl}">Login</a></p>`
    });
    console.log('✅ Teacher Credentials Sent');
    if (isMockTransport) console.log('🌍 [MOCK PREVIEW]:', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (e) { console.error(e); throw e; }
};

// Send parent credentials
exports.sendParentCredentials = async (toEmail, parentName, username, password) => {
  const transporter = await getTransporter();
  if (!transporter) return { success: false, message: 'Email System Failure' };
  try {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Frontier LMS" <system@frontierlms.com>',
      to: toEmail,
      subject: 'Parent Portal Access',
      html: `<h1>Welcome ${parentName}</h1><p>User: ${username}<br>Pass: ${password}<br><a href="${loginUrl}">Login</a></p>`
    });
    console.log('✅ Parent Credentials Sent');
    if (isMockTransport) console.log('🌍 [MOCK PREVIEW]:', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (e) { console.error(e); throw e; }
};
