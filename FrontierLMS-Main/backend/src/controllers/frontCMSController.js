// controllers/frontCMSController.js
const FrontCMSSetting = require('../models/FrontCMSSetting');

exports.getSettings = async (req, res) => {
    try {
        let settings = await FrontCMSSetting.findOne({ schoolId: req.user.schoolId });
        if (!settings) {
            settings = new FrontCMSSetting({ schoolId: req.user.schoolId });
            await settings.save();
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const settings = await FrontCMSSetting.findOneAndUpdate(
            { schoolId: req.user.schoolId },
            { $set: req.body },
            { new: true, upsert: true }
        );
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
