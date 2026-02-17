const ReferralSetting = require('../models/ReferralSetting');

exports.getReferralSettings = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const settings = await ReferralSetting.find({ schoolId }).populate({ path: 'classId', select: 'name section' });
        res.json({ success: true, data: settings });
    } catch (err) {
        console.error('Error fetching referral settings:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addReferralSetting = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const newSetting = new ReferralSetting({
            ...req.body,
            schoolId,
            classId: req.body.classId
        });
        await newSetting.save();
        const populated = await ReferralSetting.findById(newSetting._id).populate({ path: 'classId', select: 'name section' });
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        console.error('Error adding referral setting:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateReferralSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await ReferralSetting.findByIdAndUpdate(id, req.body, { new: true }).populate({ path: 'classId', select: 'name section' });
        res.json({ success: true, data: updated });
    } catch (err) {
        console.error('Error updating referral setting:', err);
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
