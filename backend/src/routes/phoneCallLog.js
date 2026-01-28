const express = require('express');
const router = express.Router();
const phoneCallLogController = require('../controllers/phoneCallLogController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', phoneCallLogController.getAllLogs);
router.get('/:id', phoneCallLogController.getLogById);
router.post('/', phoneCallLogController.createLog);
router.put('/:id', phoneCallLogController.updateLog);
router.delete('/:id', phoneCallLogController.deleteLog);

module.exports = router;
