const express = require('express');
const router = express.Router();
const staffTimeSlotController = require('../controllers/staffTimeSlotController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', staffTimeSlotController.getStaffTimeSlots);
router.post('/', staffTimeSlotController.addStaffTimeSlot);
router.put('/:id', staffTimeSlotController.updateStaffTimeSlot);
router.delete('/:id', staffTimeSlotController.deleteStaffTimeSlot);

module.exports = router;
