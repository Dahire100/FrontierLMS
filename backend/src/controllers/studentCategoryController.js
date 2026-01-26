// controllers/studentCategoryController.js
const StudentCategory = require('../models/StudentCategory');

// Get all categories for a school
exports.getAllCategories = async (req, res) => {
    const { schoolId } = req.user;

    try {
        const categories = await StudentCategory.find({ schoolId, isActive: true }).sort({ name: 1 });
        res.json({ data: categories });
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

// Add new category
exports.addCategory = async (req, res) => {
    const { schoolId } = req.user;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    try {
        const newCategory = new StudentCategory({
            name: name.trim(),
            description,
            schoolId
        });

        await newCategory.save();
        res.status(201).json({ message: 'Category added successfully', category: newCategory });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'A category with this name already exists' });
        }
        console.error('Error adding category:', err);
        res.status(500).json({ error: 'Failed to add category' });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const category = await StudentCategory.findOneAndUpdate(
            { _id: id, schoolId },
            { name, description },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ message: 'Category updated successfully', category });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'A category with this name already exists' });
        }
        console.error('Error updating category:', err);
        res.status(500).json({ error: 'Failed to update category' });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        // Soft delete by setting isActive to false
        const category = await StudentCategory.findOneAndUpdate(
            { _id: id, schoolId },
            { isActive: false },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ error: 'Failed to delete category' });
    }
};
