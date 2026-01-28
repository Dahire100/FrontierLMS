// routes/activity.js
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get statistics (before :id routes)
router.get('/stats', activityController.getActivityStats);

// Bulk delete activities
router.post('/bulk-delete', activityController.bulkDeleteActivities);

// Create activity
router.post('/', activityController.createActivity);

// Get all activities
router.get('/', activityController.getAllActivities);

// Get activity by ID
router.get('/:id', activityController.getActivityById);

// Update activity
router.put('/:id', activityController.updateActivity);

// Delete activity
router.delete('/:id', activityController.deleteActivity);

module.exports = router;
