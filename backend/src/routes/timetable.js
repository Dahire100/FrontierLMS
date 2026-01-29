// routes/timetable.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getTimetableByClass,
  getAllTimetables,
  upsertTimetable,
  deleteTimetable,
  getTeacherSchedule
} = require('../controllers/timetableController');

// All routes require authentication
router.use(authenticateToken);

router.get('/', getAllTimetables);
router.get('/class/:classId', getTimetableByClass);
router.get('/teacher/:teacherId', getTeacherSchedule);
router.post('/', upsertTimetable);
router.delete('/:id', deleteTimetable);

module.exports = router;
