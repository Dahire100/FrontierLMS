const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const onlineAdmissionController = require('../controllers/onlineAdmissionController');

router.use(authenticateToken);

router.get('/', onlineAdmissionController.getAllOnlineAdmissions);
router.post('/', onlineAdmissionController.createOnlineAdmission);
router.put('/:id', onlineAdmissionController.updateOnlineAdmission);
router.delete('/:id', onlineAdmissionController.deleteOnlineAdmission);

module.exports = router;
