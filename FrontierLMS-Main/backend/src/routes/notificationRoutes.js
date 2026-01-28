const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get my notifications
router.get('/', notificationController.getMyNotifications);

// Mark all as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Mark single as read
router.put('/:id/read', notificationController.markAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Create notification (Testing purposes or Admin usage)
router.post('/', notificationController.createNotification);

module.exports = router;
