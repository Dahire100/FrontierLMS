// routes/teacher.js
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { verifyToken } = require('../middleware/auth');
const { verifyRole } = require('../middleware/roleAuth');

// Middleware to ensure restricted access
// All routes require 'teacher' role
router.use(verifyToken, verifyRole(['teacher']));

// Dashboard
router.get('/dashboard', teacherController.getTeacherDashboard);

// Classes
router.get('/classes', teacherController.getTeacherClasses);
router.get('/classes/:classId/students', teacherController.getClassStudents);

// Homework
router.get('/homework', teacherController.getTeacherHomework);

// Lesson Plans
router.get('/lesson-plans', teacherController.getLessonPlans);
router.post('/lesson-plans', teacherController.createLessonPlan);
router.put('/lesson-plans/:id', teacherController.updateLessonPlan);
router.delete('/lesson-plans/:id', teacherController.deleteLessonPlan);

// Attendance
router.get('/attendance', teacherController.getAttendance);
router.post('/attendance', teacherController.markAttendance);

// Exams & Marks
router.get('/exams', teacherController.getTeacherExams);
router.get('/exams/:examId/results', teacherController.getExamResults);
router.post('/exams/results/bulk', teacherController.saveBulkResults);

// Leave
router.get('/leaves', teacherController.getTeacherLeaves);
router.post('/leaves', teacherController.applyLeave);
router.put('/leaves/:id/cancel', teacherController.cancelLeave);

// --- New Modules ---

// Front Office
router.get('/front-office/visitors', teacherController.getVisitors);
router.post('/front-office/visitors', teacherController.addVisitor);
router.get('/front-office/enquiries', teacherController.getEnquiries);

// Fees
router.get('/fees', teacherController.getFees);
router.post('/fees/remind', teacherController.sendFeeReminder);

// Evaluation
router.get('/evaluation/assessments', teacherController.getAssessments);
router.post('/evaluation/assessments', teacherController.createAssessment);

// Disciplinary
router.get('/disciplinary', teacherController.getDisciplinaryIncidents);
router.post('/disciplinary', teacherController.reportIncident);

// Events
router.get('/events', teacherController.getEvents);
router.post('/events/propose', teacherController.proposeEvent);

// Certificates
router.get('/certificates', teacherController.getCertificates);
router.post('/certificates', teacherController.generateCertificate);

// Consent Letters
router.get('/consent', teacherController.getConsentRequests);
router.post('/consent', teacherController.createConsentRequest);

// Profile
router.get('/profile', teacherController.getTeacherProfile);
router.put('/profile', teacherController.updateTeacherProfile);

// Timetable
router.get('/timetable', teacherController.getTeacherTimetable);

// Notice Board
router.get('/notices', teacherController.getTeacherNotices);

const upload = require('../middleware/upload');

// Downloads
router.get('/downloads', teacherController.getStudyMaterials);
router.post('/downloads', upload.single('file'), teacherController.uploadStudyMaterial);

// Library
router.get('/library/books', teacherController.getLibraryBooks);
router.get('/library/my-issued', teacherController.getMyIssuedBooks);

// Online Exam
router.get('/online-exams', teacherController.getAvailableQuizzes);
router.post('/online-exams', teacherController.createQuiz);
router.put('/online-exams/:id', teacherController.updateQuiz);
router.delete('/online-exams/:id', teacherController.deleteQuiz);

// Inventory
router.get('/inventory', teacherController.getInventory);
router.post('/inventory/request', teacherController.requestInventory);

// Reports
router.get('/reports/class-performance', teacherController.getClassPerformanceReports);

module.exports = router;
