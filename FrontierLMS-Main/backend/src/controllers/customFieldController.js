const CustomField = require('../models/CustomField');

exports.getCustomFields = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const fields = await CustomField.find({ schoolId });
        res.json({ success: true, data: fields });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addCustomField = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const newField = new CustomField({
            ...req.body,
            schoolId
        });
        await newField.save();
        res.status(201).json({ success: true, data: newField });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateCustomField = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedField = await CustomField.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ success: true, data: updatedField });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteCustomField = async (req, res) => {
    try {
        const { id } = req.params;
        await CustomField.findByIdAndDelete(id);
        res.json({ success: true, message: 'Custom field deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
