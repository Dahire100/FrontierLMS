// controllers/disciplinaryController.js
const DisciplinaryIncident = require('../models/DisciplinaryIncident');
const DisciplinaryParameter = require('../models/DisciplinaryParameter');
const DisciplinaryAssessment = require('../models/DisciplinaryAssessment');
const Complaint = require('../models/Complaint');
const Student = require('../models/Student');

// Create disciplinary incident
exports.createIncident = async (req, res) => {
    const { schoolId, _id: userId } = req.user;
    const {
        studentId,
        incidentDate,
        location,
        severity,
        description,
        actionTaken,
        remarks
    } = req.body;

    if (!studentId || !location || !description) {
        return res.status(400).json({ error: 'Student ID, location, and description are required' });
    }

    try {
        // Verify student exists
        const student = await Student.findOne({ _id: studentId, schoolId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const incident = new DisciplinaryIncident({
            schoolId,
            studentId,
            reportedBy: userId,
            incidentDate: incidentDate || Date.now(),
            location,
            severity: severity || 'medium',
            description,
            actionTaken,
            remarks,
            status: 'pending'
        });

        await incident.save();

        const populatedIncident = await DisciplinaryIncident.findById(incident._id)
            .populate('studentId', 'firstName lastName studentId class section')
            .populate('reportedBy', 'firstName lastName role');

        res.status(201).json(populatedIncident);
    } catch (err) {
        console.error('Error creating incident:', err);
        res.status(500).json({ error: 'Failed to create incident' });
    }
};

// Get all incidents
exports.getIncidents = async (req, res) => {
    const { schoolId } = req.user;
    const { studentId, severity, status, page = 1, limit = 10 } = req.query;

    try {
        const query = { schoolId };
        if (studentId) query.studentId = studentId;
        if (severity) query.severity = severity;
        if (status) query.status = status;

        const incidents = await DisciplinaryIncident.find(query)
            .populate('studentId', 'firstName lastName studentId class section')
            .populate('reportedBy', 'firstName lastName role')
            .sort({ incidentDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await DisciplinaryIncident.countDocuments(query);

        res.json({
            incidents,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (err) {
        console.error('Error fetching incidents:', err);
        res.status(500).json({ error: 'Failed to fetch incidents' });
    }
};

// Get incident by ID
exports.getIncidentById = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const incident = await DisciplinaryIncident.findOne({ _id: id, schoolId })
            .populate('studentId', 'firstName lastName studentId class section')
            .populate('reportedBy', 'firstName lastName role');

        if (!incident) {
            return res.status(404).json({ error: 'Incident not found' });
        }

        res.json(incident);
    } catch (err) {
        console.error('Error fetching incident:', err);
        res.status(500).json({ error: 'Failed to fetch incident' });
    }
};

// Update incident
exports.updateIncident = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    try {
        const incident = await DisciplinaryIncident.findOneAndUpdate(
            { _id: id, schoolId },
            updates,
            { new: true, runValidators: true }
        )
            .populate('studentId', 'firstName lastName studentId class section')
            .populate('reportedBy', 'firstName lastName role');

        if (!incident) {
            return res.status(404).json({ error: 'Incident not found' });
        }

        res.json(incident);
    } catch (err) {
        console.error('Error updating incident:', err);
        res.status(500).json({ error: 'Failed to update incident' });
    }
};

// Delete incident
exports.deleteIncident = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const incident = await DisciplinaryIncident.findOneAndDelete({ _id: id, schoolId });

        if (!incident) {
            return res.status(404).json({ error: 'Incident not found' });
        }

        res.json({ message: 'Incident deleted successfully' });
    } catch (err) {
        console.error('Error deleting incident:', err);
        res.status(500).json({ error: 'Failed to delete incident' });
    }
};

// Get incidents by student
exports.getIncidentsByStudent = async (req, res) => {
    const { schoolId } = req.user;
    const { studentId } = req.params;

    try {
        const incidents = await DisciplinaryIncident.find({ schoolId, studentId })
            .populate('reportedBy', 'firstName lastName role')
            .sort({ incidentDate: -1 });

        res.json(incidents);
    } catch (err) {
        console.error('Error fetching student incidents:', err);
        res.status(500).json({ error: 'Failed to fetch incidents' });
    }
};

// Get incident statistics
exports.getIncidentStats = async (req, res) => {
    const { schoolId } = req.user;
    const { startDate, endDate } = req.query;

    try {
        const query = { schoolId };
        if (startDate && endDate) {
            query.incidentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const stats = await DisciplinaryIncident.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    bySeverity: {
                        $push: '$severity'
                    },
                    byStatus: {
                        $push: '$status'
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    total: 1,
                    low: {
                        $size: {
                            $filter: {
                                input: '$bySeverity',
                                cond: { $eq: ['$$this', 'low'] }
                            }
                        }
                    },
                    medium: {
                        $size: {
                            $filter: {
                                input: '$bySeverity',
                                cond: { $eq: ['$$this', 'medium'] }
                            }
                        }
                    },
                    high: {
                        $size: {
                            $filter: {
                                input: '$bySeverity',
                                cond: { $eq: ['$$this', 'high'] }
                            }
                        }
                    },
                    critical: {
                        $size: {
                            $filter: {
                                input: '$bySeverity',
                                cond: { $eq: ['$$this', 'critical'] }
                            }
                        }
                    },
                    pending: {
                        $size: {
                            $filter: {
                                input: '$byStatus',
                                cond: { $eq: ['$$this', 'pending'] }
                            }
                        }
                    },
                    resolved: {
                        $size: {
                            $filter: {
                                input: '$byStatus',
                                cond: { $eq: ['$$this', 'resolved'] }
                            }
                        }
                    }
                }
            }
        ]);

        res.json(stats[0] || {
            total: 0,
            low: 0,
            medium: 0,
            high: 0,
            critical: 0,
            pending: 0,
            resolved: 0
        });
    } catch (err) {
        console.error('Error fetching incident stats:', err);
        res.status(500).json({ error: 'Failed to fetch incident statistics' });
    }
};
// PARAMETERS
exports.getParameters = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const parameters = await DisciplinaryParameter.find({ schoolId });
        res.json(parameters);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch parameters' });
    }
};

exports.createParameter = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const parameter = new DisciplinaryParameter({ ...req.body, schoolId });
        await parameter.save();
        res.status(201).json(parameter);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create parameter' });
    }
};

exports.updateParameter = async (req, res) => {
    try {
        const { id } = req.params;
        const parameter = await DisciplinaryParameter.findByIdAndUpdate(id, req.body, { new: true });
        res.json(parameter);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update parameter' });
    }
};

exports.deleteParameter = async (req, res) => {
    try {
        await DisciplinaryParameter.findByIdAndDelete(req.params.id);
        res.json({ message: 'Parameter deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete parameter' });
    }
};

// ASSESSMENTS
exports.getAssessments = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { classId, sectionId, month } = req.query;

        let query = { schoolId };
        if (month) query.month = month;

        const assessments = await DisciplinaryAssessment.find(query)
            .populate('studentId', 'firstName lastName studentId class section')
            .populate('scores.parameterId', 'name');

        res.json(assessments);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch assessments' });
    }
};

exports.createAssessment = async (req, res) => {
    try {
        const { schoolId, _id: userId } = req.user;
        const assessment = new DisciplinaryAssessment({
            ...req.body,
            schoolId,
            assessedBy: userId
        });
        await assessment.save();
        res.status(201).json(assessment);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save assessment' });
    }
};

// COMPLAINTS (DISCIPLINARY)
exports.getDisciplinaryComplaints = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const complaints = await Complaint.find({
            schoolId,
            complaintType: 'discipline'
        }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
};
