// controllers/primaryEvaluationController.js
const PrimaryEvaluation = require('../models/PrimaryEvaluation');
const Student = require('../models/Student');

// Create evaluation
exports.createEvaluation = async (req, res) => {
    const { schoolId, _id: userId } = req.user;
    const evaluationData = { ...req.body, schoolId, evaluatedBy: userId };

    if (!evaluationData.studentId || !evaluationData.classId || !evaluationData.subject || !evaluationData.term) {
        return res.status(400).json({
            error: 'Student, class, subject, and term are required'
        });
    }

    try {
        // Set academic year if not provided
        if (!evaluationData.academicYear) {
            evaluationData.academicYear = new Date().getFullYear().toString();
        }

        // Calculate attendance percentage if provided
        if (evaluationData.attendance && evaluationData.attendance.totalDays && evaluationData.attendance.presentDays) {
            evaluationData.attendance.percentage =
                ((evaluationData.attendance.presentDays / evaluationData.attendance.totalDays) * 100).toFixed(2);
        }

        const evaluation = new PrimaryEvaluation(evaluationData);
        await evaluation.save();

        const populatedEvaluation = await PrimaryEvaluation.findById(evaluation._id)
            .populate('studentId', 'firstName lastName studentId')
            .populate('classId', 'name section')
            .populate('evaluatedBy', 'firstName lastName');

        res.status(201).json({
            message: 'Evaluation created successfully',
            data: populatedEvaluation
        });
    } catch (err) {
        console.error('Error creating evaluation:', err);
        res.status(500).json({ error: 'Failed to create evaluation' });
    }
};

// Get all evaluations
exports.getAllEvaluations = async (req, res) => {
    const { schoolId } = req.user;
    const { classId, subject, term, academicYear, studentId, page = 1, limit = 10 } = req.query;

    try {
        const query = { schoolId };
        if (classId) query.classId = classId;
        if (subject) query.subject = subject;
        if (term) query.term = term;
        if (academicYear) query.academicYear = academicYear;
        if (studentId) query.studentId = studentId;

        const evaluations = await PrimaryEvaluation.find(query)
            .populate('studentId', 'firstName lastName studentId')
            .populate('classId', 'name section')
            .populate('evaluatedBy', 'firstName lastName')
            .sort({ evaluationDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await PrimaryEvaluation.countDocuments(query);

        res.json({
            evaluations,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (err) {
        console.error('Error fetching evaluations:', err);
        res.status(500).json({ error: 'Failed to fetch evaluations' });
    }
};

// Get evaluation by ID
exports.getEvaluationById = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const evaluation = await PrimaryEvaluation.findOne({ _id: id, schoolId })
            .populate('studentId', 'firstName lastName studentId email phone')
            .populate('classId', 'name section')
            .populate('evaluatedBy', 'firstName lastName email');

        if (!evaluation) {
            return res.status(404).json({ error: 'Evaluation not found' });
        }

        res.json(evaluation);
    } catch (err) {
        console.error('Error fetching evaluation:', err);
        res.status(500).json({ error: 'Failed to fetch evaluation' });
    }
};

// Update evaluation
exports.updateEvaluation = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    try {
        const evaluation = await PrimaryEvaluation.findOne({ _id: id, schoolId });

        if (!evaluation) {
            return res.status(404).json({ error: 'Evaluation not found' });
        }

        if (evaluation.isFinalized) {
            return res.status(400).json({ error: 'Cannot update finalized evaluation' });
        }

        // Recalculate attendance percentage if updated
        if (updates.attendance && updates.attendance.totalDays && updates.attendance.presentDays) {
            updates.attendance.percentage =
                ((updates.attendance.presentDays / updates.attendance.totalDays) * 100).toFixed(2);
        }

        Object.assign(evaluation, updates);
        await evaluation.save();

        const updatedEvaluation = await PrimaryEvaluation.findById(id)
            .populate('studentId', 'firstName lastName studentId')
            .populate('classId', 'name section')
            .populate('evaluatedBy', 'firstName lastName');

        res.json({
            message: 'Evaluation updated successfully',
            data: updatedEvaluation
        });
    } catch (err) {
        console.error('Error updating evaluation:', err);
        res.status(500).json({ error: 'Failed to update evaluation' });
    }
};

// Delete evaluation
exports.deleteEvaluation = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const evaluation = await PrimaryEvaluation.findOne({ _id: id, schoolId });

        if (!evaluation) {
            return res.status(404).json({ error: 'Evaluation not found' });
        }

        if (evaluation.isFinalized) {
            return res.status(400).json({ error: 'Cannot delete finalized evaluation' });
        }

        await PrimaryEvaluation.findByIdAndDelete(id);

        res.json({ message: 'Evaluation deleted successfully' });
    } catch (err) {
        console.error('Error deleting evaluation:', err);
        res.status(500).json({ error: 'Failed to delete evaluation' });
    }
};

// Finalize evaluation
exports.finalizeEvaluation = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const evaluation = await PrimaryEvaluation.findOne({ _id: id, schoolId });

        if (!evaluation) {
            return res.status(404).json({ error: 'Evaluation not found' });
        }

        if (evaluation.isFinalized) {
            return res.status(400).json({ error: 'Evaluation already finalized' });
        }

        evaluation.isFinalized = true;
        evaluation.finalizedDate = new Date();
        await evaluation.save();

        res.json({
            message: 'Evaluation finalized successfully',
            data: evaluation
        });
    } catch (err) {
        console.error('Error finalizing evaluation:', err);
        res.status(500).json({ error: 'Failed to finalize evaluation' });
    }
};

// Get student report card
exports.getStudentReportCard = async (req, res) => {
    const { schoolId } = req.user;
    const { studentId } = req.params;
    const { academicYear, term } = req.query;

    try {
        const query = {
            schoolId,
            studentId,
            isFinalized: true
        };

        if (academicYear) query.academicYear = academicYear;
        if (term) query.term = term;

        const evaluations = await PrimaryEvaluation.find(query)
            .populate('classId', 'name section')
            .populate('evaluatedBy', 'firstName lastName')
            .sort({ subject: 1 });

        if (evaluations.length === 0) {
            return res.status(404).json({ error: 'No evaluations found for this student' });
        }

        // Get student details
        const student = await Student.findById(studentId)
            .select('firstName lastName studentId class section');

        res.json({
            student,
            evaluations,
            academicYear: evaluations[0].academicYear,
            term: evaluations[0].term,
            totalSubjects: evaluations.length
        });
    } catch (err) {
        console.error('Error fetching report card:', err);
        res.status(500).json({ error: 'Failed to fetch report card' });
    }
};

// Get class performance
exports.getClassPerformance = async (req, res) => {
    const { schoolId } = req.user;
    const { classId } = req.params;
    const { subject, term, academicYear } = req.query;

    try {
        const query = {
            schoolId,
            classId,
            isFinalized: true
        };

        if (subject) query.subject = subject;
        if (term) query.term = term;
        if (academicYear) query.academicYear = academicYear;

        const evaluations = await PrimaryEvaluation.find(query)
            .populate('studentId', 'firstName lastName studentId');

        const gradeDistribution = {
            'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'E': 0
        };

        evaluations.forEach(evaluation => {
            if (evaluation.overallGrade) {
                gradeDistribution[evaluation.overallGrade]++;
            }
        });

        res.json({
            totalStudents: evaluations.length,
            gradeDistribution,
            evaluations
        });
    } catch (err) {
        console.error('Error fetching class performance:', err);
        res.status(500).json({ error: 'Failed to fetch class performance' });
    }
};

// Get evaluation statistics
exports.getEvaluationStats = async (req, res) => {
    const { schoolId } = req.user;
    const { academicYear, term } = req.query;

    try {
        const query = { schoolId };
        if (academicYear) query.academicYear = academicYear;
        if (term) query.term = term;

        const evaluations = await PrimaryEvaluation.find(query);

        const stats = {
            total: evaluations.length,
            finalized: evaluations.filter(e => e.isFinalized).length,
            draft: evaluations.filter(e => !e.isFinalized).length,
            byTerm: {},
            bySubject: {},
            byClass: {}
        };

        evaluations.forEach(evaluation => {
            stats.byTerm[evaluation.term] = (stats.byTerm[evaluation.term] || 0) + 1;
            stats.bySubject[evaluation.subject] = (stats.bySubject[evaluation.subject] || 0) + 1;
        });

        res.json(stats);
    } catch (err) {
        console.error('Error fetching evaluation stats:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

// Bulk create evaluations for a class
exports.bulkCreateEvaluations = async (req, res) => {
    const { schoolId, _id: userId } = req.user;
    const { classId, subject, term, academicYear, evaluationType } = req.body;

    if (!classId || !subject || !term) {
        return res.status(400).json({ error: 'Class, subject, and term are required' });
    }

    try {
        // Get all students in the class
        const students = await Student.find({ schoolId, class: classId });

        const evaluations = students.map(student => ({
            schoolId,
            studentId: student._id,
            classId,
            subject,
            term,
            academicYear: academicYear || new Date().getFullYear().toString(),
            evaluationType: evaluationType || 'formative',
            evaluatedBy: userId,
            skills: [],
            behavior: {}
        }));

        const created = await PrimaryEvaluation.insertMany(evaluations);

        res.status(201).json({
            message: `${created.length} evaluation templates created successfully`,
            count: created.length
        });
    } catch (err) {
        console.error('Error bulk creating evaluations:', err);
        res.status(500).json({ error: 'Failed to create evaluations' });
    }
};
