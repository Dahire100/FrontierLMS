const QuestionType = require('../models/QuestionType');

// Create
exports.createType = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { name } = req.body;

        if (!name) return res.status(400).json({ error: 'Name is required' });

        const newType = new QuestionType({ schoolId, name });
        await newType.save();
        res.status(201).json({ success: true, data: newType });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: 'Type already exists' });
        res.status(500).json({ error: 'Failed to create type' });
    }
};

// Get All
exports.getAllTypes = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const types = await QuestionType.find({ schoolId }).sort({ createdAt: -1 });
        res.json({ success: true, data: types });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch types' });
    }
};

// Update
exports.updateType = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;
        const updated = await QuestionType.findOneAndUpdate(
            { _id: id, schoolId },
            { $set: req.body },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Type not found' });
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
};

// Delete
exports.deleteType = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;
        await QuestionType.findOneAndDelete({ _id: id, schoolId });
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
};
