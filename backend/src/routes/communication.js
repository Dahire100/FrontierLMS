// routes/communication.js
const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const { verifyToken } = require('../middleware/auth');

// Send message
router.post('/', verifyToken, communicationController.sendMessage);

// Send Broadcast (Email/SMS)
router.post('/broadcast', verifyToken, communicationController.sendBroadcast);

// Get inbox
router.get('/inbox', verifyToken, communicationController.getInbox);

// Get sent messages
router.get('/sent', verifyToken, communicationController.getSentMessages);

// Get unread count
router.get('/unread/count', verifyToken, communicationController.getUnreadCount);

// Get available recipients
router.get('/recipients', verifyToken, communicationController.getRecipients);

// Get message by ID
router.get('/:id', verifyToken, communicationController.getMessageById);

// Mark as read
router.patch('/:id/read', verifyToken, communicationController.markAsRead);

// Delete message
router.delete('/:id', verifyToken, communicationController.deleteMessage);

module.exports = router;
