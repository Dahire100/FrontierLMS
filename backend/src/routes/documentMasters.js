const express = require('express');
const router = express.Router();
const documentMasterController = require('../controllers/documentMasterController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', documentMasterController.getDocumentMasters);
router.post('/', documentMasterController.addDocumentMaster);
router.put('/:id', documentMasterController.updateDocumentMaster);
router.delete('/:id', documentMasterController.deleteDocumentMaster);

module.exports = router;
