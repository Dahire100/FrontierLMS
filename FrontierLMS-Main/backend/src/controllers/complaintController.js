const Complaint = require('../models/Complaint');

// Get all complaints for a school
exports.getAllComplaints = async (req, res) => {
    try {
        const { status, priority, type } = req.query;
        const query = { schoolId: req.user.schoolId };

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (type) query.complaintType = type;

        const complaints = await Complaint.find(query)
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single complaint
exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findOne({
            _id: req.params.id,
            schoolId: req.user.schoolId
        });

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new complaint
exports.createComplaint = async (req, res) => {
    try {
        const complaintData = {
            ...req.body,
            schoolId: req.user.schoolId
        };

        const newComplaint = new Complaint(complaintData);
        await newComplaint.save();
        res.status(201).json(newComplaint);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a complaint
exports.updateComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        res.json(complaint);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a complaint
exports.deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findOneAndDelete({
            _id: req.params.id,
            schoolId: req.user.schoolId
        });

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        res.json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update complaint status or response
exports.respondToComplaint = async (req, res) => {
    try {
        const { status, response, resolutionNotes } = req.body;
        const updateData = {
            status,
            response,
            resolutionNotes,
            responseDate: new Date()
        };

        if (status === 'resolved') {
            updateData.resolvedBy = req.user.id;
            updateData.resolvedDate = new Date();
        }

        const complaint = await Complaint.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            updateData,
            { new: true }
        );

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        res.json(complaint);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
