// controllers/itemCategoryController.js
const ItemCategory = require('../models/ItemCategory');

exports.createCategory = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const category = new ItemCategory({ ...req.body, schoolId });
        await category.save();
        res.status(201).json({ message: 'Category created successfully', data: category });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const categories = await ItemCategory.find({ schoolId, isActive: true });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const category = await ItemCategory.findOneAndUpdate(
            { _id: req.params.id, schoolId },
            req.body,
            { new: true }
        );
        res.json({ message: 'Category updated', data: category });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { schoolId } = req.user;
        await ItemCategory.findOneAndDelete({ _id: req.params.id, schoolId });
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
