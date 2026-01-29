// server.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { initDB } = require('./src/config/db');
const { seedDatabase } = require('./src/config/seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database
initDB();

// Import routes
const authRoutes = require('./src/routes/auth');
const otpRoutes = require('./src/routes/otp');
const schoolRegistrationRoutes = require('./src/routes/schoolRegistration');
const studentRoutes = require('./src/routes/students');
const teacherRoutes = require('./src/routes/teachers');
const feesRoutes = require('./src/routes/fees');
const transportRoutes = require('./src/routes/transport');
const attendanceRoutes = require('./src/routes/attendance');
const examsRoutes = require('./src/routes/exams');
const termsRoutes = require('./src/routes/terms');
const gradesRoutes = require('./src/routes/grades');
const divisionsRoutes = require('./src/routes/divisions');
const dashboardRoutes = require('./src/routes/dashboard');

// Admin portal routes
const classRoutes = require('./src/routes/classes');
const subjectRoutes = require('./src/routes/subjects');
const homeworkRoutes = require('./src/routes/homework');
const noticeRoutes = require('./src/routes/notices');
const expenseRoutes = require('./src/routes/expenses');
const incomeRoutes = require('./src/routes/income');
const timetableRoutes = require('./src/routes/timetable');
const libraryRoutes = require('./src/routes/library');
const hostelRoutes = require('./src/routes/hostel');
const expenseHeadRoutes = require('./src/routes/expenseHeads');
const voucherSettingRoutes = require('./src/routes/voucherSettings');
const incomeHeadRoutes = require('./src/routes/incomeHeads');

// Teacher & Parent portal routes
const teacherPortalRoutes = require('./src/routes/teacher');
const parentPortalRoutes = require('./src/routes/parent');
const communicationRoutes = require('./src/routes/communication');
const onlineClassRoutes = require('./src/routes/onlineClass');
const leaveRoutes = require('./src/routes/leave');
const sectionRoutes = require('./src/routes/sections');
const complaintRoutes = require('./src/routes/complaints');
const admissionEnquiryRoutes = require('./src/routes/admissionEnquiry');
const onlineAdmissionRoutes = require('./src/routes/onlineAdmissions');
const visitorRoutes = require('./src/routes/visitors');
const phoneCallLogRoutes = require('./src/routes/phoneCallLog');
const postalExchangeRoutes = require('./src/routes/postalExchange');
const frontOfficeSetupRoutes = require('./src/routes/frontOfficeSetup');
const gatePassRoutes = require('./src/routes/gatePass');
const entranceExamRoutes = require('./src/routes/entranceExam');

// Partial backend modules - now complete
const consentLetterRoutes = require('./src/routes/consentLetter');
const disciplinaryRoutes = require('./src/routes/disciplinary');
const lessonPlannerRoutes = require('./src/routes/lessonPlanner');
const quizRoutes = require('./src/routes/quiz');
const studyMaterialRoutes = require('./src/routes/studyMaterial');

// Staff management (Human Resource expansion)
const staffRoutes = require('./src/routes/staff');

// New modules - Bank Info & Classwork
const bankAccountRoutes = require('./src/routes/bankAccount');
const classworkRoutes = require('./src/routes/classwork');

// New modules - Inventory & Question Paper
const inventoryRoutes = require('./src/routes/inventory');
const questionPaperRoutes = require('./src/routes/questionPaper');
const questionTypeRoutes = require('./src/routes/questionType');
const questionBankRoutes = require('./src/routes/questionBank');

// New modules - HW-CW & Primary Evaluation
const hwCwRoutes = require('./src/routes/hwCw');
const primaryEvaluationRoutes = require('./src/routes/primaryEvaluation');
const activityRoutes = require('./src/routes/activity');

// New modules - Profile & Report
const profileRoutes = require('./src/routes/profile');
const reportRoutes = require('./src/routes/report');

// New modules - Settings & System Setting
const settingRoutes = require('./src/routes/setting');
const systemSettingRoutes = require('./src/routes/systemSetting');
const notificationRoutes = require('./src/routes/notificationRoutes');

// New modules - Wallet
const walletRoutes = require('./src/routes/wallet');

// Fees Collection sub-modules
const chequeRoutes = require('./src/routes/cheques');

// System Setting sub-modules
const customFieldRoutes = require('./src/routes/customFields');
const documentMasterRoutes = require('./src/routes/documentMasters');
const academicSessionRoutes = require('./src/routes/academicSessions');
const schoolTimeRoutes = require('./src/routes/schoolTimes');
const referralSettingRoutes = require('./src/routes/referralSettings');
const staffTimeSlotRoutes = require('./src/routes/staffTimeSlots');
const templateSettingRoutes = require('./src/routes/templateSettings');
const frontCMSRoutes = require('./src/routes/frontCMS');
const userManagementRoutes = require('./src/routes/userManagement');
const cmsRoutes = require('./src/routes/cms');
const departmentRoutes = require('./src/routes/department');
const designationRoutes = require('./src/routes/designation');
const leaveTypeRoutes = require('./src/routes/leaveTypes');
const staffAttendanceRoutes = require('./src/routes/staffAttendance');






// Student portal routes
const studentPortalRoutes = require('./src/routes/studentPortal');

// Certificate routes
const certificateRoutes = require('./src/routes/certificates');

// ID Card routes
const idCardRoutes = require('./src/routes/idCard');


// CMS & Subscription routes
const subscriptionRoutes = require('./src/routes/subscription');
const eventRoutes = require('./src/routes/events');

// Super Admin routes
const superAdminRoutes = require('./src/routes/superAdmin');
const salesEnquiryRoutes = require('./src/routes/salesEnquiry');

// Debug logger for ALL requests
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/schools', schoolRegistrationRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/terms', termsRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/divisions', divisionsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Admin portal routes
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/expense-heads', expenseHeadRoutes);
app.use('/api/voucher-settings', voucherSettingRoutes);
app.use('/api/income-heads', incomeHeadRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/id-cards', idCardRoutes);

// Teacher & Parent portal routes
app.use('/api/teacher', teacherPortalRoutes);
app.use('/api/parent', parentPortalRoutes);
app.use('/api/messages', communicationRoutes);
app.use('/api/online-classes', onlineClassRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admission-enquiry', admissionEnquiryRoutes);
app.use('/api/online-admissions', onlineAdmissionRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/phone-call-log', phoneCallLogRoutes);
app.use('/api/postal-exchange', postalExchangeRoutes);
app.use('/api/front-office-setup', frontOfficeSetupRoutes);
app.use('/api/gate-pass', gatePassRoutes);
app.use('/api/entrance-exam', entranceExamRoutes);
app.use('/api/student-categories', require('./src/routes/studentCategory'));
app.use('/api/student-houses', require('./src/routes/studentHouse'));
app.use('/api/student-referrals', require('./src/routes/studentReferral'));

// Partial backend modules - now complete
app.use('/api/consent-letter', consentLetterRoutes);
app.use('/api/disciplinary', disciplinaryRoutes);
app.use('/api/lesson-planner', lessonPlannerRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/study-material', studyMaterialRoutes);

// Staff management (Human Resource expansion)
app.use('/api/staff', staffRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/staff-attendance', staffAttendanceRoutes);
app.use('/api/payroll', require('./src/routes/payroll'));
app.use('/api/hr-module', require('./src/routes/hrModule'));

// New modules - Bank Info & Classwork
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/classwork', classworkRoutes);

// New modules - Inventory & Question Paper
app.use('/api/inventory', inventoryRoutes);
app.use('/api/question-papers', questionPaperRoutes);
app.use('/api/question-types', questionTypeRoutes);
app.use('/api/question-bank', questionBankRoutes);

// New modules - HW-CW & Primary Evaluation
app.use('/api/hw-cw', hwCwRoutes);
app.use('/api/primary-evaluation', primaryEvaluationRoutes);
app.use('/api/activities', activityRoutes);

// New modules - Download Center
app.use('/api/syllabi', require('./src/routes/syllabus'));
app.use('/api/videos', require('./src/routes/video'));
app.use('/api/file-categories', require('./src/routes/fileCategory'));
app.use('/api/download-content', require('./src/routes/downloadContent'));

// New modules - Profile & Report
app.use('/api/profile', profileRoutes);
app.use('/api/reports', reportRoutes);

// New modules - Settings & System Setting
app.use('/api/settings', settingRoutes);
app.use('/api/system-setting', systemSettingRoutes);
app.use('/api/notifications', notificationRoutes);

// New modules - Wallet
app.use('/api/wallet', walletRoutes);

// Fees Collection sub-modules
app.use('/api/fees/cheques', chequeRoutes);

// System Setting sub-modules
app.use('/api/custom-fields', customFieldRoutes);
app.use('/api/document-masters', documentMasterRoutes);
app.use('/api/academic-sessions', academicSessionRoutes);
app.use('/api/school-times', schoolTimeRoutes);
app.use('/api/referral-settings', referralSettingRoutes);
app.use('/api/staff-time-slots', staffTimeSlotRoutes);
app.use('/api/template-settings', templateSettingRoutes);
app.use('/api/front-cms', frontCMSRoutes);
app.use('/api/user-management', userManagementRoutes);
app.use('/api/cms', cmsRoutes);







// Student portal routes
app.use('/api/student', studentPortalRoutes);

// CMS & Subscription routes
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/events', eventRoutes);

// Super Admin routes
app.use('/api/super-admin', superAdminRoutes);

// Debug middleware for sales enquiry
app.use('/api/sales-enquiry', (req, res, next) => {
  console.log(`📨 Request to /api/sales-enquiry: ${req.method}`);
  next();
}, salesEnquiryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Frontier ERP Backend is running',
    timestamp: new Date().toISOString(),
    routes: [
      '/api/auth/login',
      '/api/otp/send-otp',
      '/api/otp/verify-otp',
      '/api/schools/register',
      '/api/students',
      '/api/teachers',
      '/api/fees',
      '/api/transport',
      '/api/attendance',
      '/api/exams',
      '/api/dashboard',
      '/api/classes',
      '/api/subjects',
      '/api/homework',
      '/api/notices',
      '/api/expenses',
      '/api/income',
      '/api/timetable',
      '/api/library',
      '/api/hostel',
      '/api/teacher',
      '/api/parent',
      '/api/messages',
      '/api/online-classes',
      '/api/leave-requests',
      '/api/leave-requests',
      '/api/student',
      '/api/cms',
      '/api/subscription',
      '/api/consent-letter',
      '/api/disciplinary',
      '/api/lesson-planner',
      '/api/quiz',
      '/api/study-material'
    ]
  });
});


if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🕒 Started at ${new Date().toISOString()}`);
    console.log(`🍃 MongoDB initialized`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log('\n📋 Core API Routes:');
    console.log('   POST /api/otp/send-otp - Send OTP for login');
    console.log('   POST /api/otp/verify-otp - Verify OTP and login');
    console.log('   POST /api/schools/register - Register new school');
    console.log('   GET  /api/dashboard - Get dashboard data');
    console.log('\n📚 Admin Portal Routes:');
    console.log('   GET  /api/classes - Class management');
    console.log('   GET  /api/subjects - Subject management');
    console.log('   GET  /api/homework - Homework management');
    console.log('   GET  /api/notices - Notice board');
    console.log('   GET  /api/expenses - Expense tracking');
    console.log('   GET  /api/income - Income tracking');
    console.log('   GET  /api/timetable - Timetable management');
    console.log('   GET  /api/library - Library management');
    console.log('   GET  /api/hostel - Hostel management');
    console.log('\n🔐 OTP-based authentication enabled');
  });
}

module.exports = app;
// Server verified and active
