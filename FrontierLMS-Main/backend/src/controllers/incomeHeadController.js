const IncomeHead = require('../models/IncomeHead');

exports.getAllHeads = async (req, res) => {
    try {
        const heads = await IncomeHead.find({ schoolId: req.user.schoolId }).sort({ name: 1 });
        res.status(200).json({ success: true, data: heads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createHead = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const newHead = new IncomeHead({
            schoolId: req.user.schoolId,
            name,
            description,
            isActive: isActive !== undefined ? isActive : true,
            addedBy: req.user.id
        });
        await newHead.save();
        res.status(201).json({ success: true, data: newHead });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Income Head already exists' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateHead = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const head = await IncomeHead.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            { name, description, isActive },
            { new: true }
        );
        if (!head) return res.status(404).json({ success: false, message: 'Income Head not found' });
        res.status(200).json({ success: true, data: head });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteHead = async (req, res) => {
    try {
        const head = await IncomeHead.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!head) return res.status(404).json({ success: false, message: 'Income Head not found' });
        res.status(200).json({ success: true, message: 'Income Head deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
