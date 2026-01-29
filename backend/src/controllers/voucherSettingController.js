const VoucherSetting = require('../models/VoucherSetting');

exports.getAllSettings = async (req, res) => {
    try {
        const settings = await VoucherSetting.find({ schoolId: req.user.schoolId }).sort({ prefix: 1 });
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createSetting = async (req, res) => {
    try {
        const { prefix, lastUsed, digits, description } = req.body;
        const newSetting = new VoucherSetting({
            schoolId: req.user.schoolId,
            prefix,
            lastUsed: lastUsed || 0,
            digits: digits || 4,
            description,
            addedBy: req.user.id
        });
        await newSetting.save();
        res.status(201).json({ success: true, data: newSetting });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Prefix already exists' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSetting = async (req, res) => {
    try {
        const { lastUsed, digits, description, isActive } = req.body;
        const setting = await VoucherSetting.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            { lastUsed, digits, description, isActive },
            { new: true }
        );
        if (!setting) return res.status(404).json({ success: false, message: 'Setting not found' });
        res.status(200).json({ success: true, data: setting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSetting = async (req, res) => {
    try {
        const setting = await VoucherSetting.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!setting) return res.status(404).json({ success: false, message: 'Setting not found' });
        res.status(200).json({ success: true, message: 'Setting deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
