const express = require('express');
const router = express.Router();
const { authenticateToken, requireSchoolAdmin } = require('../middleware/auth');
const {
    getAllTerms,
    addTerm,
    updateTerm,
    deleteTerm
} = require('../controllers/termController');

router.use(authenticateToken);

// Accessible by school admin, teachers, and students (read-only)
router.get('/', getAllTerms);

// School admin only routes
router.post('/', requireSchoolAdmin, addTerm);
router.put('/:id', requireSchoolAdmin, updateTerm);
router.delete('/:id', requireSchoolAdmin, deleteTerm);

module.exports = router;
