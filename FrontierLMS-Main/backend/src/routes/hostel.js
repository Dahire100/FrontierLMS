// routes/hostel.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllHostels,
  createHostel,
  updateHostel,
  deleteHostel,
  getRoomsByHostel,
  createRoom,
  updateRoom,
  getAllAllocations,
  allocateStudent,
  vacateStudent,
  getAttendance,
  markAttendance,
  bulkMarkAttendance,
  getHostelFees,
  updateHostelFee
} = require('../controllers/hostelController');

// All routes require authentication
router.use(authenticateToken);

// Hostel management
router.get('/', getAllHostels);
router.post('/', createHostel);
router.put('/:id', updateHostel);
router.delete('/:id', deleteHostel);

// Room management
router.get('/:hostelId/rooms', getRoomsByHostel);
router.post('/rooms', createRoom);
router.put('/rooms/:id', updateRoom);

// Allocation management
router.get('/allocations', getAllAllocations);
router.post('/allocations', allocateStudent);
router.post('/allocations/:id/vacate', vacateStudent);

// Attendance management
router.get('/attendance', getAttendance);
router.post('/attendance', markAttendance);
router.post('/attendance/bulk', bulkMarkAttendance);

// Fees management
router.get('/fees', getHostelFees);
router.put('/fees/:id', updateHostelFee);

module.exports = router;
