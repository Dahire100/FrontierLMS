// controllers/classworkController.js
const Classwork = require('../models/Classwork');
const Student = require('../models/Student');

// Create classwork
exports.createClasswork = async (req, res) => {
    const { schoolId, _id: userId } = req.user;
    const {
        classId,
        subject,
        title,
        description,
        assignedDate,
        dueDate,
        maxMarks,
        attachments
    } = req.body;

    if (!classId || !subject || !title || !description) {
        return res.status(400).json({ error: 'Class, subject, title, and description are required' });
    }

    try {
        const classwork = new Classwork({
            schoolId,
            teacherId: userId,
            classId,
            subject,
            title,
            description,
            assignedDate: assignedDate || Date.now(),
            dueDate,
            maxMarks: maxMarks || 0,
            attachments: attachments || [],
            isGraded: maxMarks > 0
        });

        await classwork.save();

        const populatedClasswork = await Classwork.findById(classwork._id)
            .populate('teacherId', 'firstName lastName')
            .populate('classId', 'name section');

        res.status(201).json({
            message: 'Classwork created successfully',
            data: populatedClasswork
        });
    } catch (err) {
        console.error('Error creating classwork:', err);
        res.status(500).json({ error: 'Failed to create classwork' });
    }
};

// Get all classwork
exports.getAllClasswork = async (req, res) => {
    const { schoolId } = req.user;
    const { classId, subject, status, page = 1, limit = 10 } = req.query;

    try {
        const query = { schoolId };
        if (classId) query.classId = classId;
        if (subject) query.subject = subject;
        if (status) query.status = status;

        const classwork = await Classwork.find(query)
            .populate('teacherId', 'firstName lastName')
            .populate('classId', 'name section')
            .sort({ assignedDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Classwork.countDocuments(query);

        res.json({
            classwork,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (err) {
        console.error('Error fetching classwork:', err);
        res.status(500).json({ error: 'Failed to fetch classwork' });
    }
};

// Get classwork by ID
exports.getClassworkById = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const classwork = await Classwork.findOne({ _id: id, schoolId })
            .populate('teacherId', 'firstName lastName')
            .populate('classId', 'name section')
            .populate('submissions.studentId', 'firstName lastName studentId');

        if (!classwork) {
            return res.status(404).json({ error: 'Classwork not found' });
        }

        res.json(classwork);
    } catch (err) {
        console.error('Error fetching classwork:', err);
        res.status(500).json({ error: 'Failed to fetch classwork' });
    }
};

// Update classwork
exports.updateClasswork = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    try {
        const classwork = await Classwork.findOneAndUpdate(
            { _id: id, schoolId },
            updates,
            { new: true, runValidators: true }
        )
            .populate('teacherId', 'firstName lastName')
            .populate('classId', 'name section');

        if (!classwork) {
            return res.status(404).json({ error: 'Classwork not found' });
        }

        res.json({ message: 'Classwork updated successfully', data: classwork });
    } catch (err) {
        console.error('Error updating classwork:', err);
        res.status(500).json({ error: 'Failed to update classwork' });
    }
};

// Delete classwork
exports.deleteClasswork = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const classwork = await Classwork.findOneAndDelete({ _id: id, schoolId });

        if (!classwork) {
            return res.status(404).json({ error: 'Classwork not found' });
        }

        res.json({ message: 'Classwork deleted successfully' });
    } catch (err) {
        console.error('Error deleting classwork:', err);
        res.status(500).json({ error: 'Failed to delete classwork' });
    }
};

// Submit classwork (student)
exports.submitClasswork = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { studentId, content, attachments } = req.body;

    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    try {
        const classwork = await Classwork.findOne({ _id: id, schoolId });

        if (!classwork) {
            return res.status(404).json({ error: 'Classwork not found' });
        }

        // Check if student already submitted
        const existingSubmission = classwork.submissions.find(
            s => s.studentId.toString() === studentId
        );

        if (existingSubmission) {
            return res.status(400).json({ error: 'Classwork already submitted' });
        }

        // Add submission
        classwork.submissions.push({
            studentId,
            submittedAt: new Date(),
            content,
            attachments: attachments || [],
            status: 'submitted'
        });

        await classwork.save();

        res.json({ message: 'Classwork submitted successfully' });
    } catch (err) {
        console.error('Error submitting classwork:', err);
        res.status(500).json({ error: 'Failed to submit classwork' });
    }
};

// Grade submission
exports.gradeSubmission = async (req, res) => {
    const { schoolId } = req.user;
    const { id, submissionId } = req.params;
    const { marks, feedback } = req.body;

    try {
        const classwork = await Classwork.findOne({ _id: id, schoolId });

        if (!classwork) {
            return res.status(404).json({ error: 'Classwork not found' });
        }

        const submission = classwork.submissions.id(submissionId);

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        submission.marks = marks;
        submission.maxMarks = classwork.maxMarks;
        submission.feedback = feedback;
        submission.status = 'graded';

        await classwork.save();

        res.json({ message: 'Submission graded successfully' });
    } catch (err) {
        console.error('Error grading submission:', err);
        res.status(500).json({ error: 'Failed to grade submission' });
    }
};

// Get classwork by student
exports.getClassworkByStudent = async (req, res) => {
    const { schoolId } = req.user;
    const { studentId } = req.params;

    try {
        // Get student's class
        const student = await Student.findOne({ _id: studentId, schoolId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const classwork = await Classwork.find({
            schoolId,
            classId: student.class
        })
            .populate('teacherId', 'firstName lastName')
            .populate('classId', 'name section')
            .sort({ assignedDate: -1 });

        // Add submission status for this student
        const result = classwork.map(cw => {
            const submission = cw.submissions.find(
                s => s.studentId.toString() === studentId
            );

            return {
                ...cw.toObject(),
                studentSubmission: submission || null,
                hasSubmitted: !!submission
            };
        });

        res.json(result);
    } catch (err) {
        console.error('Error fetching student classwork:', err);
        res.status(500).json({ error: 'Failed to fetch classwork' });
    }
};

// Get classwork statistics
exports.getClassworkStats = async (req, res) => {
    const { schoolId } = req.user;
    const { classId } = req.query;

    try {
        const query = { schoolId };
        if (classId) query.classId = classId;

        const classwork = await Classwork.find(query);

        const stats = {
            total: classwork.length,
            pending: classwork.filter(cw => cw.status === 'pending').length,
            inProgress: classwork.filter(cw => cw.status === 'in-progress').length,
            completed: classwork.filter(cw => cw.status === 'completed').length,
            totalSubmissions: classwork.reduce((sum, cw) => sum + cw.submissions.length, 0),
            graded: classwork.reduce((sum, cw) =>
                sum + cw.submissions.filter(s => s.status === 'graded').length, 0
            )
        };

        res.json(stats);
    } catch (err) {
        console.error('Error fetching classwork stats:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};
