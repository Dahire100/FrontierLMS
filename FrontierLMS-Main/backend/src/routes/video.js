const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create new video
router.post('/', videoController.createVideo);

// Get all videos
router.get('/', videoController.getAllVideos);

// Get video statistics
router.get('/stats', videoController.getVideoStats);

// Get video by ID
router.get('/:id', videoController.getVideoById);

// Update video
router.put('/:id', videoController.updateVideo);

// Delete video
router.delete('/:id', videoController.deleteVideo);

// Increment view count
router.post('/:id/view', videoController.incrementView);

// Bulk delete videos
router.post('/bulk-delete', videoController.bulkDeleteVideos);

module.exports = router;
