// routes/studentPortal.js
const express = require('express');
const router = express.Router();
const studentPortalController = require('../controllers/studentPortalController');
const { verifyToken } = require('../middleware/auth');
const { verifyRole } = require('../middleware/roleAuth');
const profileUpload = require('../middleware/profileUpload');

// Dashboard
router.get('/dashboard', verifyToken, verifyRole(['student']), studentPortalController.getStudentDashboard);

// Profile
router.get('/profile', verifyToken, verifyRole(['student']), studentPortalController.getStudentProfile);
router.put('/profile', verifyToken, verifyRole(['student']), studentPortalController.updateStudentProfile);
router.put('/profile/picture', verifyToken, verifyRole(['student']), profileUpload.single('profilePicture'), studentPortalController.updateStudentProfilePicture);

// Attendance
router.get('/attendance', verifyToken, verifyRole(['student']), studentPortalController.getStudentAttendance);
router.get('/attendance/download', verifyToken, verifyRole(['student']), studentPortalController.downloadAttendanceReport);

// Homework
router.get('/homework', verifyToken, verifyRole(['student']), studentPortalController.getStudentHomework);
router.post('/homework/:homeworkId/submit', verifyToken, verifyRole(['student']), studentPortalController.submitHomework);

// Assignments
router.get('/assignments', verifyToken, verifyRole(['student']), studentPortalController.getStudentAssignments);
router.post('/assignments/:assignmentId/submit', verifyToken, verifyRole(['student']), studentPortalController.submitAssignment);

// Exams
router.get('/exams', verifyToken, verifyRole(['student']), studentPortalController.getStudentExams);
router.get('/results', verifyToken, verifyRole(['student']), studentPortalController.getStudentResults);

// Exam Applications & Admit Cards
router.get('/exams/applications', verifyToken, verifyRole(['student']), studentPortalController.getExamApplications);
router.post('/exams/apply', verifyToken, verifyRole(['student']), studentPortalController.submitExamApplication);
router.get('/exams/admit-cards', verifyToken, verifyRole(['student']), studentPortalController.getAdmitCards);
router.get('/exams/admit-card/:id/download', verifyToken, verifyRole(['student']), studentPortalController.downloadAdmitCard);

// Fees
router.get('/fees', verifyToken, verifyRole(['student']), studentPortalController.getStudentFees);

// Timetable
router.get('/timetable', verifyToken, verifyRole(['student']), studentPortalController.getStudentTimetable);

// Online Classes
router.get('/online-classes', verifyToken, verifyRole(['student']), studentPortalController.getStudentOnlineClasses);

// Leave Requests
router.get('/leave-requests', verifyToken, verifyRole(['student']), studentPortalController.getStudentLeaveRequests);

// Progress Reports
router.get('/progress', verifyToken, verifyRole(['student']), studentPortalController.getStudentProgress);

// Notices
router.get('/notices', verifyToken, verifyRole(['student']), studentPortalController.getStudentNotices);

// Complaints
router.post('/complaints', verifyToken, verifyRole(['student']), studentPortalController.submitComplaint);
router.get('/complaints', verifyToken, verifyRole(['student']), studentPortalController.getStudentComplaints);

// Certificates
router.get('/certificates', verifyToken, verifyRole(['student']), studentPortalController.getStudentCertificates);

// Events
router.get('/events', verifyToken, verifyRole(['student']), studentPortalController.getSchoolEvents);
router.post('/events/:eventId/register', verifyToken, verifyRole(['student']), studentPortalController.registerForEvent);

// Quizzes
router.get('/quizzes', verifyToken, verifyRole(['student']), studentPortalController.getStudentQuizzes);
router.get('/quizzes/:quizId/start', verifyToken, verifyRole(['student']), studentPortalController.startQuiz);
router.post('/quizzes/:quizId/submit', verifyToken, verifyRole(['student']), studentPortalController.submitQuiz);

// Library History & Requests
router.get('/library/history', verifyToken, verifyRole(['student']), studentPortalController.getLibraryHistory);
router.post('/library/request', verifyToken, verifyRole(['student']), studentPortalController.requestBook);
router.get('/library/requests', verifyToken, verifyRole(['student']), studentPortalController.getBookRequests);

// Transport
router.get('/transport', verifyToken, verifyRole(['student']), studentPortalController.getTransportDetails);

// Hostel
router.get('/hostel', verifyToken, verifyRole(['student']), studentPortalController.getHostelDetails);
router.post('/hostel/outpass', verifyToken, verifyRole(['student']), studentPortalController.applyOutpass);
router.get('/hostel/outpass/history', verifyToken, verifyRole(['student']), studentPortalController.getOutpassHistory);

const documentUpload = require('../middleware/documentUpload');

// Documents
router.get('/documents', verifyToken, verifyRole(['student']), studentPortalController.getStudentDocuments);
router.post('/documents', verifyToken, verifyRole(['student']), documentUpload.single('file'), studentPortalController.uploadStudentDocument);

// Downloads (Study Materials)
router.get('/downloads', verifyToken, verifyRole(['student']), studentPortalController.getDownloads);

module.exports = router;
