const express = require('express');
const router = express.Router();
const { authenticateToken, requireSchoolAdmin } = require('../middleware/auth');
const { getAllCheques, addCheque, updateCheque, deleteCheque } = require('../controllers/chequeController');

router.use(authenticateToken);
router.use(requireSchoolAdmin);

router.get('/', getAllCheques);
router.post('/', addCheque);
router.put('/:id', updateCheque);
router.delete('/:id', deleteCheque);

module.exports = router;
