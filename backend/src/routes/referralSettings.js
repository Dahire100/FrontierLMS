const express = require('express');
const router = express.Router();
const referralSettingController = require('../controllers/referralSettingController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', referralSettingController.getReferralSettings);
router.post('/', referralSettingController.addReferralSetting);
router.put('/:id', referralSettingController.updateReferralSetting);
router.delete('/:id', referralSettingController.deleteReferralSetting);

module.exports = router;
