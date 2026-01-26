const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent
} = require('../controllers/eventController');

// All routes require authentication
router.use(verifyToken);

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
