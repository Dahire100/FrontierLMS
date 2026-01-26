// routes/studentCategory.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireSchoolAdmin } = require('../middleware/auth');
const {
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/studentCategoryController');

// All routes require authentication
router.use(authenticateToken);

// School admin only routes
router.post('/', requireSchoolAdmin, addCategory);
router.put('/:id', requireSchoolAdmin, updateCategory);
router.delete('/:id', requireSchoolAdmin, deleteCategory);

// Accessible by school admin and teachers
router.get('/', getAllCategories);

module.exports = router;
