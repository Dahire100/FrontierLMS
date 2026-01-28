// routes/parent.js
const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { verifyToken } = require('../middleware/auth');
const { verifyRole } = require('../middleware/roleAuth');
const profileUpload = require('../middleware/profileUpload');

// Dashboard
router.get('/dashboard', verifyToken, verifyRole(['parent']), parentController.getParentDashboard);
router.put('/profile', verifyToken, verifyRole(['parent']), profileUpload.single('profilePicture'), parentController.updateParentProfile);

// Child Information
router.get('/child/:studentId', verifyToken, verifyRole(['parent']), parentController.getChildDetails);
router.put('/child/:studentId/profile-picture', verifyToken, verifyRole(['parent']), profileUpload.single('profilePicture'), parentController.updateChildProfilePicture);

// Attendance
router.get('/child/:studentId/attendance', verifyToken, verifyRole(['parent']), parentController.getChildAttendance);

// Homework
router.get('/child/:studentId/homework', verifyToken, verifyRole(['parent']), parentController.getChildHomework);

// Exam Results
router.get('/child/:studentId/results', verifyToken, verifyRole(['parent']), parentController.getChildExamResults);
router.get('/child/:studentId/exam-schedule', verifyToken, verifyRole(['parent']), parentController.getChildExamSchedule);

// Fees
router.get('/child/:studentId/fees', verifyToken, verifyRole(['parent']), parentController.getChildFees);

// Progress Reports
router.get('/child/:studentId/progress', verifyToken, verifyRole(['parent']), parentController.getChildProgress);

// Notices
router.get('/notices', verifyToken, verifyRole(['parent']), parentController.getParentNotices);

// Timetable
router.get('/child/:studentId/timetable', verifyToken, verifyRole(['parent']), parentController.getChildTimetable);

// Online Classes
router.get('/child/:studentId/online-classes', verifyToken, verifyRole(['parent']), parentController.getChildOnlineClasses);

// Library History
router.get('/child/:studentId/library/history', verifyToken, verifyRole(['parent']), parentController.getChildLibraryHistory);

// Transport
router.get('/child/:studentId/transport', verifyToken, verifyRole(['parent']), parentController.getChildTransport);

// Hostel
router.get('/child/:studentId/hostel', verifyToken, verifyRole(['parent']), parentController.getChildHostel);
router.post('/child/:studentId/hostel/outpass', verifyToken, verifyRole(['parent']), parentController.applyChildOutpass);
router.get('/child/:studentId/hostel/outpass', verifyToken, verifyRole(['parent']), parentController.getChildHostelOutpasses);

// Downloads
router.get('/child/:studentId/downloads', verifyToken, verifyRole(['parent']), parentController.getChildDownloads);

// Leave Application
router.post('/child/:studentId/leave', verifyToken, verifyRole(['parent']), parentController.applyChildLeave);
router.get('/child/:studentId/leaves', verifyToken, verifyRole(['parent']), parentController.getChildLeaveHistory);

module.exports = router;
