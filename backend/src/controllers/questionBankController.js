const QuestionBank = require('../models/QuestionBank');

// Create Question
exports.createQuestion = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const questionData = { ...req.body, schoolId };

        const question = new QuestionBank(questionData);
        await question.save();

        res.status(201).json({ success: true, data: question });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create question' });
    }
};

// Get Questions
exports.getQuestions = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { classId, subject, questionType, level, page = 1, limit = 10 } = req.query;

        const query = { schoolId };
        if (classId) query.classId = classId;
        if (subject) query.subject = { $regex: subject, $options: 'i' };
        if (questionType) query.questionType = questionType;
        if (level) query.level = level;

        const questions = await QuestionBank.find(query)
            .populate('questionType', 'name')
            .populate('classId', 'name section')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await QuestionBank.countDocuments(query);

        res.json({
            success: true,
            data: questions,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
};

// Update
exports.updateQuestion = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;

        const question = await QuestionBank.findOneAndUpdate(
            { _id: id, schoolId },
            req.body,
            { new: true }
        );

        if (!question) return res.status(404).json({ error: 'Question not found' });
        res.json({ success: true, data: question });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
};

// Delete
exports.deleteQuestion = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;
        await QuestionBank.findOneAndDelete({ _id: id, schoolId });
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
};
