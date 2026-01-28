// controllers/hwCwController.js
const Homework = require('../models/Homework');
const Classwork = require('../models/Classwork');

// Get unified view (both homework and classwork)
exports.getUnifiedView = async (req, res) => {
    const { schoolId } = req.user;
    const { classId, subject, startDate, endDate, status, page = 1, limit = 10 } = req.query;

    try {
        const query = { schoolId };
        if (classId) query.classId = classId;
        if (subject) query.subject = subject;
        if (status) query.status = status;

        // Date range filter
        if (startDate && endDate) {
            query.assignedDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Fetch both homework and classwork
        const [homework, classwork] = await Promise.all([
            Homework.find(query)
                .populate('assignedBy', 'firstName lastName')
                .populate('classId', 'name section')
                .sort({ assignedDate: -1 }),
            Classwork.find(query)
                .populate('teacherId', 'firstName lastName')
                .populate('classId', 'name section')
                .sort({ assignedDate: -1 })
        ]);

        // Add type identifier
        const homeworkItems = homework.map(item => {
            const doc = item.toObject();
            return {
                ...doc,
                teacherId: doc.assignedBy, // Unify the teacher field for the frontend
                type: 'homework',
                workType: 'HW'
            };
        });

        const classworkItems = classwork.map(item => ({
            ...item.toObject(),
            type: 'classwork',
            workType: 'CW'
        }));

        // Combine and sort by date
        let combined = [...homeworkItems, ...classworkItems].sort((a, b) =>
            new Date(b.assignedDate) - new Date(a.assignedDate)
        );

        // Pagination
        const total = combined.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        combined = combined.slice(startIndex, endIndex);

        res.json({
            items: combined,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total,
            homework: homeworkItems.length,
            classwork: classworkItems.length
        });
    } catch (err) {
        console.error('Error fetching unified view:', err);
        res.status(500).json({ error: 'Failed to fetch unified view' });
    }
};

// Get unified view by student
exports.getUnifiedViewByStudent = async (req, res) => {
    const { schoolId } = req.user;
    const { studentId } = req.params;
    const { startDate, endDate, status } = req.query;

    try {
        const Student = require('../models/Student');
        const student = await Student.findOne({ _id: studentId, schoolId });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const query = {
            schoolId,
            classId: student.class
        };

        if (status) query.status = status;

        if (startDate && endDate) {
            query.assignedDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const [homework, classwork] = await Promise.all([
            Homework.find(query)
                .populate('assignedBy', 'firstName lastName')
                .populate('classId', 'name section')
                .sort({ assignedDate: -1 }),
            Classwork.find(query)
                .populate('teacherId', 'firstName lastName')
                .populate('classId', 'name section')
                .sort({ assignedDate: -1 })
        ]);

        // Add student submission status
        const homeworkWithStatus = homework.map(hw => {
            const doc = hw.toObject();
            const submission = doc.submissions.find(s => s.studentId.toString() === studentId);
            return {
                ...doc,
                teacherId: doc.assignedBy, // Unify the teacher field for the frontend
                type: 'homework',
                workType: 'HW',
                studentSubmission: submission || null,
                hasSubmitted: !!submission,
                submissionStatus: submission?.status || 'pending'
            };
        });

        const classworkWithStatus = classwork.map(cw => {
            const submission = cw.submissions.find(s => s.studentId.toString() === studentId);
            return {
                ...cw.toObject(),
                type: 'classwork',
                workType: 'CW',
                studentSubmission: submission || null,
                hasSubmitted: !!submission,
                submissionStatus: submission?.status || 'pending'
            };
        });

        const combined = [...homeworkWithStatus, ...classworkWithStatus].sort((a, b) =>
            new Date(b.assignedDate) - new Date(a.assignedDate)
        );

        res.json({
            items: combined,
            total: combined.length,
            homework: homeworkWithStatus.length,
            classwork: classworkWithStatus.length,
            pending: combined.filter(item => !item.hasSubmitted).length,
            submitted: combined.filter(item => item.hasSubmitted).length,
            graded: combined.filter(item => item.submissionStatus === 'graded').length
        });
    } catch (err) {
        console.error('Error fetching student unified view:', err);
        res.status(500).json({ error: 'Failed to fetch student view' });
    }
};

// Get statistics
exports.getHwCwStats = async (req, res) => {
    const { schoolId } = req.user;
    const { classId, subject, startDate, endDate } = req.query;

    try {
        const query = { schoolId };
        if (classId) query.classId = classId;
        if (subject) query.subject = subject;

        if (startDate && endDate) {
            query.assignedDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const [homework, classwork] = await Promise.all([
            Homework.find(query),
            Classwork.find(query)
        ]);

        const stats = {
            total: homework.length + classwork.length,
            homework: {
                total: homework.length,
                pending: homework.filter(h => h.status === 'pending').length,
                inProgress: homework.filter(h => h.status === 'in-progress').length,
                completed: homework.filter(h => h.status === 'completed').length,
                totalSubmissions: homework.reduce((sum, h) => sum + h.submissions.length, 0)
            },
            classwork: {
                total: classwork.length,
                pending: classwork.filter(c => c.status === 'pending').length,
                inProgress: classwork.filter(c => c.status === 'in-progress').length,
                completed: classwork.filter(c => c.status === 'completed').length,
                totalSubmissions: classwork.reduce((sum, c) => sum + c.submissions.length, 0)
            }
        };

        res.json(stats);
    } catch (err) {
        console.error('Error fetching HW-CW stats:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

// Get upcoming deadlines
exports.getUpcomingDeadlines = async (req, res) => {
    const { schoolId } = req.user;
    const { classId, days = 7 } = req.query;

    try {
        const query = {
            schoolId,
            dueDate: {
                $gte: new Date(),
                $lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
            }
        };

        if (classId) query.classId = classId;

        const [homework, classwork] = await Promise.all([
            Homework.find(query)
                .populate('assignedBy', 'firstName lastName')
                .populate('classId', 'name section')
                .sort({ dueDate: 1 }),
            Classwork.find(query)
                .populate('teacherId', 'firstName lastName')
                .populate('classId', 'name section')
                .sort({ dueDate: 1 })
        ]);

        const homeworkDeadlines = homework.map(item => {
            const doc = item.toObject();
            return {
                ...doc,
                teacherId: doc.assignedBy, // Unify
                type: 'homework',
                workType: 'HW'
            };
        });

        const classworkDeadlines = classwork.map(item => ({
            ...item.toObject(),
            type: 'classwork',
            workType: 'CW'
        }));

        const deadlines = [...homeworkDeadlines, ...classworkDeadlines].sort((a, b) =>
            new Date(a.dueDate) - new Date(b.dueDate)
        );

        res.json(deadlines);
    } catch (err) {
        console.error('Error fetching upcoming deadlines:', err);
        res.status(500).json({ error: 'Failed to fetch deadlines' });
    }
};

// Get overdue items
exports.getOverdueItems = async (req, res) => {
    const { schoolId } = req.user;
    const { classId } = req.query;

    try {
        const query = {
            schoolId,
            dueDate: { $lt: new Date() },
            status: { $ne: 'completed' }
        };

        if (classId) query.classId = classId;

        const [homework, classwork] = await Promise.all([
            Homework.find(query)
                .populate('assignedBy', 'firstName lastName')
                .populate('classId', 'name section')
                .sort({ dueDate: 1 }),
            Classwork.find(query)
                .populate('teacherId', 'firstName lastName')
                .populate('classId', 'name section')
                .sort({ dueDate: 1 })
        ]);

        const homeworkOverdue = homework.map(item => {
            const doc = item.toObject();
            return {
                ...doc,
                teacherId: doc.assignedBy, // Unify
                type: 'homework',
                workType: 'HW',
                daysOverdue: Math.floor((new Date() - new Date(item.dueDate)) / (1000 * 60 * 60 * 24))
            };
        });

        const classworkOverdue = classwork.map(item => ({
            ...item.toObject(),
            type: 'classwork',
            workType: 'CW',
            daysOverdue: Math.floor((new Date() - new Date(item.dueDate)) / (1000 * 60 * 60 * 24))
        }));

        const overdue = [...homeworkOverdue, ...classworkOverdue].sort((a, b) =>
            new Date(a.dueDate) - new Date(b.dueDate)
        );

        res.json(overdue);
    } catch (err) {
        console.error('Error fetching overdue items:', err);
        res.status(500).json({ error: 'Failed to fetch overdue items' });
    }
};

// Get completion rate
exports.getCompletionRate = async (req, res) => {
    const { schoolId } = req.user;
    const { classId, startDate, endDate } = req.query;

    try {
        const query = { schoolId };
        if (classId) query.classId = classId;

        if (startDate && endDate) {
            query.assignedDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const [homework, classwork] = await Promise.all([
            Homework.find(query),
            Classwork.find(query)
        ]);

        const totalItems = homework.length + classwork.length;
        const completedItems = homework.filter(h => h.status === 'completed').length +
            classwork.filter(c => c.status === 'completed').length;

        const completionRate = totalItems > 0
            ? ((completedItems / totalItems) * 100).toFixed(2)
            : 0;

        res.json({
            total: totalItems,
            completed: completedItems,
            pending: totalItems - completedItems,
            completionRate: parseFloat(completionRate),
            homework: {
                total: homework.length,
                completed: homework.filter(h => h.status === 'completed').length
            },
            classwork: {
                total: classwork.length,
                completed: classwork.filter(c => c.status === 'completed').length
            }
        });
    } catch (err) {
        console.error('Error calculating completion rate:', err);
        res.status(500).json({ error: 'Failed to calculate completion rate' });
    }
};
