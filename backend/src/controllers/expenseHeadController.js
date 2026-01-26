// controllers/expenseHeadController.js
const ExpenseHead = require('../models/ExpenseHead');

exports.getAllHeads = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const heads = await ExpenseHead.find({ schoolId }).sort({ name: 1 });
        res.json({ success: true, data: heads });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch expense heads' });
    }
};

exports.createHead = async (req, res) => {
    try {
        const { schoolId, userId } = req.user;
        const { name, description } = req.body;
        const newHead = new ExpenseHead({
            schoolId,
            name,
            description,
            addedBy: userId
        });
        await newHead.save();
        res.status(201).json({ success: true, data: newHead });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to create head' });
    }
};

exports.updateHead = async (req, res) => {
    try {
        const { id } = req.params;
        const head = await ExpenseHead.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ success: true, data: head });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update head' });
    }
};

exports.deleteHead = async (req, res) => {
    try {
        const { id } = req.params;
        await ExpenseHead.findByIdAndDelete(id);
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to delete head' });
    }
};
