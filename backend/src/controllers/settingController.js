// controllers/elementController.js (Generic Settings Controller)
const GeneralSetting = require('../models/GeneralSetting');
const School = require('../models/School');

// Get general settings
exports.getGeneralSettings = async (req, res) => {
    const { schoolId } = req.user;

    try {
        let settings = await GeneralSetting.findOne({ schoolId });

        if (!settings) {
            // Create default settings from school data
            const school = await School.findById(schoolId);
            if (!school) {
                return res.status(404).json({ error: 'School not found' });
            }

            settings = new GeneralSetting({
                schoolId,
                schoolName: school.name,
                address: school.address,
                phone: school.phone,
                email: school.email,
                academicYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString()
            });
            await settings.save();
        }

        res.json(settings);
    } catch (err) {
        console.error('Error fetching general settings:', err);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

// Update general settings
exports.updateGeneralSettings = async (req, res) => {
    const { schoolId, _id: userId } = req.user;
    const updates = { ...req.body, updatedBy: userId };

    try {
        const settings = await GeneralSetting.findOneAndUpdate(
            { schoolId },
            { $set: updates },
            { new: true, upsert: true, runValidators: true }
        );

        res.json({
            message: 'Settings updated successfully',
            data: settings
        });
    } catch (err) {
        console.error('Error updating general settings:', err);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};

// Upload logo/favicon (Placeholder for file upload logic)
exports.uploadBranding = async (req, res) => {
    const { schoolId } = req.user;
    const { logoUrl, faviconUrl } = req.body;

    try {
        const updates = {};
        if (logoUrl) updates.logo = logoUrl;
        if (faviconUrl) updates.favicon = faviconUrl;

        const settings = await GeneralSetting.findOneAndUpdate(
            { schoolId },
            { $set: updates },
            { new: true }
        );

        res.json({
            message: 'Branding updated successfully',
            data: settings
        });
    } catch (err) {
        console.error('Error updating branding:', err);
        res.status(500).json({ error: 'Failed to update branding' });
    }
};
