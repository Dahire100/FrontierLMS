// controllers/quizController.js
const Quiz = require('../models/Quiz');
const Student = require('../models/Student');

// Create quiz
exports.createQuiz = async (req, res) => {
    const { schoolId, _id: userId } = req.user;
    const {
        classId,
        subject,
        title,
        description,
        duration,
        totalMarks,
        passingMarks,
        questions,
        scheduledDate,
        startTime,
        endTime
    } = req.body;

    if (!classId || !subject || !title || !duration || !totalMarks || !passingMarks || !questions || !scheduledDate || !startTime || !endTime) {
        return res.status(400).json({
            error: 'All required fields must be provided'
        });
    }

    try {
        const quiz = new Quiz({
            schoolId,
            classId,
            teacherId: userId,
            subject,
            title,
            description,
            duration,
            totalMarks,
            passingMarks,
            questions,
            scheduledDate,
            startTime,
            endTime,
            attempts: [],
            status: 'scheduled'
        });

        await quiz.save();

        const populatedQuiz = await Quiz.findById(quiz._id)
            .populate('teacherId', 'firstName lastName')
            .populate('classId', 'name section');

        res.status(201).json(populatedQuiz);
    } catch (err) {
        console.error('Error creating quiz:', err);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
};

// Get all quizzes
exports.getQuizzes = async (req, res) => {
    const { schoolId } = req.user;
    const { classId, subject, status, page = 1, limit = 10 } = req.query;

    try {
        const query = { schoolId };
        if (classId) query.classId = classId;
        if (subject) query.subject = subject;
        if (status) query.status = status;

        const quizzes = await Quiz.find(query)
            .populate('teacherId', 'firstName lastName')
            .populate('classId', 'name section')
            .select('-questions.correctAnswer') // Don't expose correct answers
            .sort({ scheduledDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Quiz.countDocuments(query);

        res.json({
            quizzes,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (err) {
        console.error('Error fetching quizzes:', err);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
};

// Get quiz by ID (for teachers - includes correct answers)
exports.getQuizById = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const quiz = await Quiz.findOne({ _id: id, schoolId })
            .populate('teacherId', 'firstName lastName')
            .populate('classId', 'name section')
            .populate('attempts.studentId', 'firstName lastName studentId');

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json(quiz);
    } catch (err) {
        console.error('Error fetching quiz:', err);
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
};

// Get quiz for student (without correct answers)
exports.getQuizForStudent = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { studentId } = req.query;

    try {
        const quiz = await Quiz.findOne({ _id: id, schoolId })
            .populate('teacherId', 'firstName lastName')
            .populate('classId', 'name section')
            .select('-questions.correctAnswer');

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Check if student has already attempted
        const attempt = quiz.attempts.find(
            a => a.studentId.toString() === studentId
        );

        res.json({
            ...quiz.toObject(),
            hasAttempted: !!attempt,
            studentAttempt: attempt ? {
                startedAt: attempt.startedAt,
                submittedAt: attempt.submittedAt,
                score: attempt.score,
                percentage: attempt.percentage,
                result: attempt.result
            } : null
        });
    } catch (err) {
        console.error('Error fetching quiz for student:', err);
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    try {
        const quiz = await Quiz.findOneAndUpdate(
            { _id: id, schoolId },
            updates,
            { new: true, runValidators: true }
        )
            .populate('teacherId', 'firstName lastName')
            .populate('classId', 'name section');

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json(quiz);
    } catch (err) {
        console.error('Error updating quiz:', err);
        res.status(500).json({ error: 'Failed to update quiz' });
    }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const quiz = await Quiz.findOneAndDelete({ _id: id, schoolId });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json({ message: 'Quiz deleted successfully' });
    } catch (err) {
        console.error('Error deleting quiz:', err);
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
};

// Start quiz attempt
exports.startQuizAttempt = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    try {
        const quiz = await Quiz.findOne({ _id: id, schoolId });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Check if already attempted
        const existingAttempt = quiz.attempts.find(
            a => a.studentId.toString() === studentId
        );

        if (existingAttempt) {
            return res.status(400).json({ error: 'Quiz already attempted' });
        }

        // Add new attempt
        quiz.attempts.push({
            studentId,
            startedAt: new Date(),
            answers: []
        });

        await quiz.save();
        res.json({ message: 'Quiz attempt started', startedAt: new Date() });
    } catch (err) {
        console.error('Error starting quiz attempt:', err);
        res.status(500).json({ error: 'Failed to start quiz attempt' });
    }
};

// Submit quiz attempt
exports.submitQuizAttempt = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { studentId, answers } = req.body;

    if (!studentId || !answers) {
        return res.status(400).json({ error: 'Student ID and answers are required' });
    }

    try {
        const quiz = await Quiz.findOne({ _id: id, schoolId });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Find the attempt
        const attemptIndex = quiz.attempts.findIndex(
            a => a.studentId.toString() === studentId && !a.submittedAt
        );

        if (attemptIndex === -1) {
            return res.status(404).json({ error: 'Active quiz attempt not found' });
        }

        // Calculate score
        let score = 0;
        answers.forEach((answer, index) => {
            if (quiz.questions[index] && answer.answer === quiz.questions[index].correctAnswer) {
                score += quiz.questions[index].marks;
            }
        });

        const percentage = (score / quiz.totalMarks) * 100;
        const result = score >= quiz.passingMarks ? 'pass' : 'fail';

        // Update attempt
        quiz.attempts[attemptIndex].submittedAt = new Date();
        quiz.attempts[attemptIndex].answers = answers;
        quiz.attempts[attemptIndex].score = score;
        quiz.attempts[attemptIndex].percentage = percentage;
        quiz.attempts[attemptIndex].result = result;

        await quiz.save();

        res.json({
            message: 'Quiz submitted successfully',
            score,
            percentage,
            result,
            totalMarks: quiz.totalMarks,
            passingMarks: quiz.passingMarks
        });
    } catch (err) {
        console.error('Error submitting quiz attempt:', err);
        res.status(500).json({ error: 'Failed to submit quiz attempt' });
    }
};

// Get quiz results
exports.getQuizResults = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const quiz = await Quiz.findOne({ _id: id, schoolId })
            .populate('attempts.studentId', 'firstName lastName studentId')
            .select('title subject totalMarks passingMarks attempts');

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        const results = quiz.attempts
            .filter(a => a.submittedAt)
            .map(a => ({
                studentId: a.studentId._id,
                studentName: `${a.studentId.firstName} ${a.studentId.lastName}`,
                rollNo: a.studentId.studentId,
                score: a.score,
                percentage: a.percentage,
                result: a.result,
                submittedAt: a.submittedAt
            }));

        res.json({
            quizTitle: quiz.title,
            subject: quiz.subject,
            totalMarks: quiz.totalMarks,
            passingMarks: quiz.passingMarks,
            results
        });
    } catch (err) {
        console.error('Error fetching quiz results:', err);
        res.status(500).json({ error: 'Failed to fetch quiz results' });
    }
};

// Get student's quiz history
exports.getStudentQuizHistory = async (req, res) => {
    const { schoolId } = req.user;
    const { studentId } = req.params;

    try {
        const quizzes = await Quiz.find({
            schoolId,
            'attempts.studentId': studentId
        })
            .populate('teacherId', 'firstName lastName')
            .populate('classId', 'name section')
            .select('-questions.correctAnswer')
            .sort({ scheduledDate: -1 });

        const history = quizzes.map(quiz => {
            const attempt = quiz.attempts.find(
                a => a.studentId.toString() === studentId
            );

            return {
                quizId: quiz._id,
                title: quiz.title,
                subject: quiz.subject,
                scheduledDate: quiz.scheduledDate,
                totalMarks: quiz.totalMarks,
                score: attempt?.score,
                percentage: attempt?.percentage,
                result: attempt?.result,
                submittedAt: attempt?.submittedAt
            };
        });

        res.json(history);
    } catch (err) {
        console.error('Error fetching student quiz history:', err);
        res.status(500).json({ error: 'Failed to fetch quiz history' });
    }
};
