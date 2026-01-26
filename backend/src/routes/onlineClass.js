// routes/onlineClass.js
const express = require('express');
const router = express.Router();
const onlineClassController = require('../controllers/onlineClassController');
const { verifyToken } = require('../middleware/auth');
const { verifyRole } = require('../middleware/roleAuth');

// Get all online classes (admin)
router.get('/', verifyToken, verifyRole(['school_admin', 'super_admin']), onlineClassController.getAllOnlineClasses);

// Get teacher's online classes
router.get('/teacher', verifyToken, verifyRole(['teacher']), onlineClassController.getTeacherOnlineClasses);

// Get student's online classes
router.get('/student', verifyToken, verifyRole(['parent', 'student']), onlineClassController.getStudentOnlineClasses);

// Create online class
router.post('/', verifyToken, verifyRole(['teacher', 'school_admin']), onlineClassController.createOnlineClass);

// Update online class
router.put('/:id', verifyToken, verifyRole(['teacher', 'school_admin']), onlineClassController.updateOnlineClass);

// Delete online class
router.delete('/:id', verifyToken, verifyRole(['teacher', 'school_admin']), onlineClassController.deleteOnlineClass);

// Record attendance
router.post('/:id/attendance', verifyToken, verifyRole(['teacher']), onlineClassController.recordAttendance);

module.exports = router;
