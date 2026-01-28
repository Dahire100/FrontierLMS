// routes/schoolRegistration.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const {
  registerSchool,
  approveRegistration,
  rejectRegistration,
  getPendingRegistrations,
  getAllRegistrations,
  autoApproveSchool,
  autoRejectSchool,
  getActiveSchools,
  updateSchoolStatus,
  getSchoolPublicInfo
} = require('../controllers/schoolRegistrationController');

// Public route for school registration
router.post('/register', registerSchool);
router.get('/active', getActiveSchools);
router.get('/public/:slug', getSchoolPublicInfo);

// Protected routes for super admin
router.use(authenticateToken);
router.use(requireSuperAdmin); // All routes below require super admin

router.get('/pending', getPendingRegistrations);
router.get('/all', getAllRegistrations);
router.post('/approve', approveRegistration);
router.post('/reject', rejectRegistration);

// New auto-approve and auto-reject routes
router.post('/:schoolId/approve', autoApproveSchool);
router.post('/:schoolId/reject', autoRejectSchool);
router.patch('/:schoolId/status', updateSchoolStatus);

module.exports = router;