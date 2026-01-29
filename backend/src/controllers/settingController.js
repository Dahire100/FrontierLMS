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
                schoolName: school.schoolName || school.name,
                address: school.address,
                phone: school.contactNumber || school.phone,
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

// Upload logo/favicon
exports.uploadBranding = async (req, res) => {
    const { schoolId } = req.user;

    try {
        let logoUrl = req.body.logoUrl;

        // If file was uploaded
        if (req.file) {
            logoUrl = `/uploads/logos/${req.file.filename}`;
        }

        if (!logoUrl) {
            return res.status(400).json({ error: 'No logo file or URL provided' });
        }

        // Update GeneralSetting
        const settings = await GeneralSetting.findOneAndUpdate(
            { schoolId },
            { $set: { logo: logoUrl } },
            { new: true, upsert: true }
        );

        // Update School model as well for consistency
        await School.findByIdAndUpdate(schoolId, { logo: logoUrl });

        res.json({
            message: 'Branding updated successfully',
            data: {
                logo: logoUrl,
                settings
            }
        });
    } catch (err) {
        console.error('Error updating branding:', err);
        res.status(500).json({ error: 'Failed to update branding' });
    }
};
