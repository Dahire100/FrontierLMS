const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getAllSections,
    createSection,
    updateSection,
    deleteSection
} = require('../controllers/sectionController');

// All routes require authentication
router.use(authenticateToken);

router.get('/', getAllSections);
router.post('/', createSection);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);

module.exports = router;
