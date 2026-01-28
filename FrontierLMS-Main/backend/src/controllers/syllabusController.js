const Syllabus = require('../models/Syllabus');

// Create new syllabus
exports.createSyllabus = async (req, res) => {
    try {
        const syllabusData = {
            ...req.body,
            schoolId: req.user.schoolId,
            uploadedBy: req.user.userId
        };

        const syllabus = new Syllabus(syllabusData);
        await syllabus.save();

        res.status(201).json({
            success: true,
            message: 'Syllabus created successfully',
            data: syllabus
        });
    } catch (error) {
        console.error('Error creating syllabus:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create syllabus',
            error: error.message
        });
    }
};

// Get all syllabi
exports.getAllSyllabi = async (req, res) => {
    try {
        const { classId, section, subject, academicYear, term } = req.query;
        const filter = { schoolId: req.user.schoolId, isActive: true };

        if (classId) filter.classId = classId;
        if (section) filter.section = section;
        if (subject) filter.subject = subject;
        if (academicYear) filter.academicYear = academicYear;
        if (term) filter.term = term;

        const syllabi = await Syllabus.find(filter)
            .populate('classId', 'name')
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: syllabi,
            count: syllabi.length
        });
    } catch (error) {
        console.error('Error fetching syllabi:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch syllabi',
            error: error.message
        });
    }
};

// Get syllabus by ID
exports.getSyllabusById = async (req, res) => {
    try {
        const syllabus = await Syllabus.findOne({
            _id: req.params.id,
            schoolId: req.user.schoolId
        })
            .populate('classId', 'name')
            .populate('uploadedBy', 'name email');

        if (!syllabus) {
            return res.status(404).json({
                success: false,
                message: 'Syllabus not found'
            });
        }

        res.status(200).json({
            success: true,
            data: syllabus
        });
    } catch (error) {
        console.error('Error fetching syllabus:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch syllabus',
            error: error.message
        });
    }
};

// Update syllabus
exports.updateSyllabus = async (req, res) => {
    try {
        const syllabus = await Syllabus.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!syllabus) {
            return res.status(404).json({
                success: false,
                message: 'Syllabus not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Syllabus updated successfully',
            data: syllabus
        });
    } catch (error) {
        console.error('Error updating syllabus:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update syllabus',
            error: error.message
        });
    }
};

// Delete syllabus
exports.deleteSyllabus = async (req, res) => {
    try {
        const syllabus = await Syllabus.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            { isActive: false },
            { new: true }
        );

        if (!syllabus) {
            return res.status(404).json({
                success: false,
                message: 'Syllabus not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Syllabus deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting syllabus:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete syllabus',
            error: error.message
        });
    }
};

// Increment download count
exports.incrementDownload = async (req, res) => {
    try {
        const syllabus = await Syllabus.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            { $inc: { downloadCount: 1 } },
            { new: true }
        );

        if (!syllabus) {
            return res.status(404).json({
                success: false,
                message: 'Syllabus not found'
            });
        }

        res.status(200).json({
            success: true,
            data: syllabus
        });
    } catch (error) {
        console.error('Error updating download count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update download count',
            error: error.message
        });
    }
};

// Bulk delete syllabi
exports.bulkDeleteSyllabi = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid syllabus IDs'
            });
        }

        await Syllabus.updateMany(
            { _id: { $in: ids }, schoolId: req.user.schoolId },
            { isActive: false }
        );

        res.status(200).json({
            success: true,
            message: 'Syllabi deleted successfully'
        });
    } catch (error) {
        console.error('Error bulk deleting syllabi:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete syllabi',
            error: error.message
        });
    }
};
