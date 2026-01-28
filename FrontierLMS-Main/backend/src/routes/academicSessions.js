const express = require('express');
const router = express.Router();
const academicSessionController = require('../controllers/academicSessionController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', academicSessionController.getSessions);
router.post('/', academicSessionController.addSession);
router.put('/:id', academicSessionController.updateSession);
router.delete('/:id', academicSessionController.deleteSession);

module.exports = router;
