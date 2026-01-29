const OnlineAdmission = require('../models/OnlineAdmission');

exports.getAllOnlineAdmissions = async (req, res) => {
    try {
        const { startDate, endDate, keyword } = req.query;
        const query = { schoolId: req.user.schoolId };

        if (startDate && endDate) {
            query.appliedDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate) {
            query.appliedDate = { $gte: new Date(startDate) };
        } else if (endDate) {
            query.appliedDate = { $lte: new Date(endDate) };
        }

        if (keyword) {
            const regex = new RegExp(keyword, 'i');
            query.$or = [
                { studentName: regex },
                { fatherName: regex },
                { mobile: regex },
                { transactionId: regex },
                { category: regex }
            ];
        }

        const admissions = await OnlineAdmission.find(query).sort({ appliedDate: -1 });
        res.json({ success: true, data: admissions });
    } catch (error) {
        console.error('Error fetching online admissions:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch online admissions' });
    }
};

exports.createOnlineAdmission = async (req, res) => {
    try {
        const admissionData = {
            ...req.body,
            schoolId: req.user.schoolId
        };
        const newAdmission = new OnlineAdmission(admissionData);
        await newAdmission.save();
        res.status(201).json({ success: true, data: newAdmission });
    } catch (error) {
        console.error('Error creating online admission:', error);
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.deleteOnlineAdmission = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await OnlineAdmission.findOneAndDelete({ _id: id, schoolId: req.user.schoolId });
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Admission record not found' });
        }
        res.json({ success: true, message: 'Admission record deleted successfully' });
    } catch (error) {
        console.error('Error deleting online admission:', error);
        res.status(500).json({ success: false, error: 'Failed to delete admission record' });
    }
};

exports.updateOnlineAdmission = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await OnlineAdmission.findOneAndUpdate(
            { _id: id, schoolId: req.user.schoolId },
            { $set: req.body },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Admission record not found' });
        }
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating online admission:', error);
        res.status(500).json({ success: false, error: 'Failed to update admission record' });
    }
}
