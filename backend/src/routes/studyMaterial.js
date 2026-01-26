const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { uploadMaterial, getMaterials, deleteMaterial } = require('../controllers/studyMaterialController');

router.use(authenticateToken);

router.post('/', uploadMaterial);
router.get('/', getMaterials);
router.delete('/:id', deleteMaterial);

module.exports = router;
