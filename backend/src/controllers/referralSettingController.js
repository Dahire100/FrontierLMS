const ReferralSetting = require('../models/ReferralSetting');

exports.getReferralSettings = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const settings = await ReferralSetting.find({ schoolId }).populate('classId', 'className');
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addReferralSetting = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const newSetting = new ReferralSetting({
            ...req.body,
            schoolId
        });
        await newSetting.save();
        const populated = await ReferralSetting.findById(newSetting._id).populate('classId', 'className');
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateReferralSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await ReferralSetting.findByIdAndUpdate(id, req.body, { new: true }).populate('classId', 'className');
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteReferralSetting = async (req, res) => {
    try {
        const { id } = req.params;
        await ReferralSetting.findByIdAndDelete(id);
        res.json({ success: true, message: "Setting deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
