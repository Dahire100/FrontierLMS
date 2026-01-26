const StudentReferral = require('../models/StudentReferral');

exports.getAllReferrals = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const referrals = await StudentReferral.find({ schoolId }).sort({ createdAt: -1 });
        res.json({ success: true, data: referrals });
    } catch (error) {
        console.error('Error fetching referrals:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch referrals' });
    }
};

exports.createReferral = async (req, res) => {
    try {
        const { schoolId, id: userId } = req.user;
        const { referralBy, studentName, email, mobile, note } = req.body;

        if (!studentName || !mobile || !referralBy) {
            return res.status(400).json({ success: false, error: 'Required fields missing' });
        }

        const newReferral = new StudentReferral({
            schoolId,
            referralBy,
            studentName,
            email,
            mobile,
            note,
            assignedBy: userId
        });

        await newReferral.save();
        res.status(201).json({ success: true, data: newReferral });
    } catch (error) {
        console.error('Error creating referral:', error);
        res.status(500).json({ success: false, error: 'Failed to create referral' });
    }
};

exports.deleteReferral = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;

        const deleted = await StudentReferral.findOneAndDelete({ _id: id, schoolId });
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Referral not found' });
        }
        res.json({ success: true, message: 'Referral deleted successfully' });
    } catch (error) {
        console.error('Error deleting referral:', error);
        res.status(500).json({ success: false, error: 'Failed to delete referral' });
    }
};

exports.updateReferral = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;

        const updated = await StudentReferral.findOneAndUpdate(
            { _id: id, schoolId },
            { $set: req.body },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Referral not found' });
        }
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating referral:', error);
        res.status(500).json({ success: false, error: 'Failed to update referral' });
    }
}
