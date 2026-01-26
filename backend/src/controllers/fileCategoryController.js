const FileCategory = require('../models/FileCategory');

// Create new file category
exports.createFileCategory = async (req, res) => {
    try {
        const categoryData = {
            ...req.body,
            schoolId: req.user.schoolId,
            createdBy: req.user.userId
        };

        const category = new FileCategory(categoryData);
        await category.save();

        res.status(201).json({
            success: true,
            message: 'File category created successfully',
            data: category
        });
    } catch (error) {
        console.error('Error creating file category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create file category',
            error: error.message
        });
    }
};

// Get all file categories
exports.getAllFileCategories = async (req, res) => {
    try {
        const { categoryType, isActive } = req.query;
        const filter = { schoolId: req.user.schoolId };

        if (categoryType) filter.categoryType = categoryType;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const categories = await FileCategory.find(filter)
            .populate('createdBy', 'name email')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: categories,
            count: categories.length
        });
    } catch (error) {
        console.error('Error fetching file categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch file categories',
            error: error.message
        });
    }
};

// Get file category by ID
exports.getFileCategoryById = async (req, res) => {
    try {
        const category = await FileCategory.findOne({
            _id: req.params.id,
            schoolId: req.user.schoolId
        }).populate('createdBy', 'name email');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'File category not found'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error fetching file category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch file category',
            error: error.message
        });
    }
};

// Update file category
exports.updateFileCategory = async (req, res) => {
    try {
        const category = await FileCategory.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'File category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'File category updated successfully',
            data: category
        });
    } catch (error) {
        console.error('Error updating file category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update file category',
            error: error.message
        });
    }
};

// Delete file category
exports.deleteFileCategory = async (req, res) => {
    try {
        const category = await FileCategory.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            { isActive: false },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'File category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'File category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting file category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete file category',
            error: error.message
        });
    }
};

// Bulk delete file categories
exports.bulkDeleteFileCategories = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid category IDs'
            });
        }

        await FileCategory.updateMany(
            { _id: { $in: ids }, schoolId: req.user.schoolId },
            { isActive: false }
        );

        res.status(200).json({
            success: true,
            message: 'File categories deleted successfully'
        });
    } catch (error) {
        console.error('Error bulk deleting file categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete file categories',
            error: error.message
        });
    }
};
