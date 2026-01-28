const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const studentReferralController = require('../controllers/studentReferralController');

router.use(authenticateToken);

router.get('/', studentReferralController.getAllReferrals);
router.post('/', studentReferralController.createReferral);
router.put('/:id', studentReferralController.updateReferral);
router.delete('/:id', studentReferralController.deleteReferral);

module.exports = router;
