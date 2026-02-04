// controllers/elementController.js (Generic Settings Controller)
const GeneralSetting = require('../models/GeneralSetting');
const School = require('../models/School');

// Get general settings
exports.getGeneralSettings = async (req, res) => {
    try {
        if (!req.user || !req.user.schoolId) {
            console.error("User or schoolId missing in request");
            return res.status(400).json({ error: 'User context missing' });
        }
        const { schoolId } = req.user;
        console.log(`Fetching settings for schoolId: ${schoolId}`);

        let settings = await GeneralSetting.findOne({ schoolId });

        if (!settings) {
            console.log("Settings not found, creating defaults...");
            // Create default settings from school data
            const school = await School.findById(schoolId);
            if (!school) {
                console.error(`School not found for ID: ${schoolId}`);
                return res.status(404).json({ error: 'School not found' });
            }

            settings = new GeneralSetting({
                schoolId,
                schoolName: school.schoolName || school.name || "My School",
                address: school.address || "Address Pending",
                phone: school.contactNumber || school.phone || "",
                email: school.email || "",
                academicYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString()
            });
            await settings.save();
            console.log("Default settings created.");
        } else {
            // Patch existing settings if name or academicYear is missing
            let needsPatch = false;

            // Ensure schoolName
            if (!settings.schoolName) {
                console.log("Settings missing schoolName, patching...");
                const school = await School.findById(schoolId);
                if (school) {
                    settings.schoolName = school.schoolName || school.name || "My School";
                    settings.address = settings.address || school.address;
                    settings.phone = settings.phone || school.contactNumber || school.phone;
                    settings.email = settings.email || school.email;
                } else {
                    settings.schoolName = "My School"; // Ultimate fallback
                }
                needsPatch = true;
            }

            // Ensure academicYear (Required by Schema)
            if (!settings.academicYear) {
                console.log("Settings missing academicYear, patching...");
                settings.academicYear = new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString();
                needsPatch = true;
            }

            if (needsPatch) {
                await settings.save();
                console.log("Settings patched and saved.");
            }
        }

        res.json(settings);
    } catch (err) {
        console.error('Error fetching general settings:', err);
        res.status(500).json({ error: 'Failed to fetch settings', details: err.message });
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
