const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', complaintController.getAllComplaints);
router.get('/:id', complaintController.getComplaintById);
router.post('/', complaintController.createComplaint);
router.put('/:id', complaintController.updateComplaint);
router.patch('/:id/respond', complaintController.respondToComplaint);
router.delete('/:id', complaintController.deleteComplaint);

module.exports = router;
