// routes/students.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireSchoolAdmin } = require('../middleware/auth');
const {
  getAllStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent,
  importStudents,
  getStudentFees,
  getStudentTransport,
  getStudentAttendance,
  bulkDeleteStudents,
  readmitStudent,
  getDeletedStudents,
  promoteStudents
} = require('../controllers/studentController');

// All routes require authentication
router.use(authenticateToken);

// School admin only routes
const upload = require('../middleware/studentUpload');
const { getPendingDocuments, verifyDocument } = require('../controllers/studentController');

router.get('/documents/pending', requireSchoolAdmin, getPendingDocuments);
router.post('/documents/:id/verify', requireSchoolAdmin, verifyDocument);

router.post('/promote', requireSchoolAdmin, promoteStudents);
router.post('/import', requireSchoolAdmin, importStudents);
router.post('/', requireSchoolAdmin, upload.any(), addStudent);
router.put('/:id', requireSchoolAdmin, updateStudent);
router.delete('/:id', requireSchoolAdmin, deleteStudent);
router.post('/bulk-delete', requireSchoolAdmin, bulkDeleteStudents);
router.post('/:id/readmit', requireSchoolAdmin, readmitStudent);
router.get('/deleted-list', requireSchoolAdmin, getDeletedStudents);

// Routes accessible by school admin, teachers, and students (for their own data)
router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.get('/:id/fees', getStudentFees);
router.get('/:id/transport', getStudentTransport);
router.get('/:id/attendance', getStudentAttendance);

module.exports = router;