const AdmissionEnquiry = require('../models/AdmissionEnquiry');

exports.getAllEnquiries = async (req, res) => {
    try {
        const { status, source, startDate, endDate } = req.query;
        const query = { schoolId: req.user.schoolId };

        if (status && status !== 'all') query.status = status;
        if (source && source !== 'all') query.source = source;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const enquiries = await AdmissionEnquiry.find(query)
            .populate('classId', 'name')
            .sort({ date: -1 });

        res.json(enquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEnquiryById = async (req, res) => {
    try {
        const enquiry = await AdmissionEnquiry.findOne({
            _id: req.params.id,
            schoolId: req.user.schoolId
        }).populate('classId', 'name');

        if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
        res.json(enquiry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createEnquiry = async (req, res) => {
    try {
        const enquiryData = {
            ...req.body,
            schoolId: req.user.schoolId
        };

        const newEnquiry = new AdmissionEnquiry(enquiryData);
        await newEnquiry.save();
        res.status(201).json(newEnquiry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateEnquiry = async (req, res) => {
    try {
        const enquiry = await AdmissionEnquiry.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
        res.json(enquiry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteEnquiry = async (req, res) => {
    try {
        const enquiry = await AdmissionEnquiry.findOneAndDelete({
            _id: req.params.id,
            schoolId: req.user.schoolId
        });

        if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
        res.json({ message: 'Enquiry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
