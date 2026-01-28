// controllers/questionPaperController.js
const QuestionPaper = require('../models/QuestionPaper');

// Create question paper
exports.createQuestionPaper = async (req, res) => {
    const { schoolId, _id: userId } = req.user;
    const paperData = { ...req.body, schoolId, createdBy: userId };

    if (!paperData.title || !paperData.subject || !paperData.class || !paperData.examType || !paperData.duration || !paperData.totalMarks) {
        return res.status(400).json({
            error: 'Title, subject, class, exam type, duration, and total marks are required'
        });
    }

    try {
        // Set academic year if not provided
        if (!paperData.academicYear) {
            paperData.academicYear = new Date().getFullYear().toString();
        }

        const questionPaper = new QuestionPaper(paperData);
        await questionPaper.save();

        const populatedPaper = await QuestionPaper.findById(questionPaper._id)
            .populate('createdBy', 'firstName lastName')
            .populate('examId', 'examName date');

        res.status(201).json({
            message: 'Question paper created successfully',
            data: populatedPaper
        });
    } catch (err) {
        console.error('Error creating question paper:', err);
        res.status(500).json({ error: 'Failed to create question paper' });
    }
};

// Get all question papers
exports.getAllQuestionPapers = async (req, res) => {
    const { schoolId } = req.user;
    const { subject, class: className, examType, status, academicYear, page = 1, limit = 10 } = req.query;

    try {
        const query = { schoolId };
        if (subject) query.subject = subject;
        if (className) query.class = className;
        if (examType) query.examType = examType;
        if (status) query.status = status;
        if (academicYear) query.academicYear = academicYear;

        const papers = await QuestionPaper.find(query)
            .populate('createdBy', 'firstName lastName')
            .populate('approvedBy', 'firstName lastName')
            .populate('examId', 'examName date')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await QuestionPaper.countDocuments(query);

        res.json({
            papers,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (err) {
        console.error('Error fetching question papers:', err);
        res.status(500).json({ error: 'Failed to fetch question papers' });
    }
};

// Get question paper by ID
exports.getQuestionPaperById = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const paper = await QuestionPaper.findOne({ _id: id, schoolId })
            .populate('createdBy', 'firstName lastName email')
            .populate('approvedBy', 'firstName lastName')
            .populate('examId', 'examName date totalMarks');

        if (!paper) {
            return res.status(404).json({ error: 'Question paper not found' });
        }

        res.json(paper);
    } catch (err) {
        console.error('Error fetching question paper:', err);
        res.status(500).json({ error: 'Failed to fetch question paper' });
    }
};

// Update question paper
exports.updateQuestionPaper = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    try {
        const paper = await QuestionPaper.findOneAndUpdate(
            { _id: id, schoolId },
            updates,
            { new: true, runValidators: true }
        )
            .populate('createdBy', 'firstName lastName')
            .populate('approvedBy', 'firstName lastName');

        if (!paper) {
            return res.status(404).json({ error: 'Question paper not found' });
        }

        res.json({ message: 'Question paper updated successfully', data: paper });
    } catch (err) {
        console.error('Error updating question paper:', err);
        res.status(500).json({ error: 'Failed to update question paper' });
    }
};

// Delete question paper
exports.deleteQuestionPaper = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const paper = await QuestionPaper.findOneAndDelete({ _id: id, schoolId });

        if (!paper) {
            return res.status(404).json({ error: 'Question paper not found' });
        }

        res.json({ message: 'Question paper deleted successfully' });
    } catch (err) {
        console.error('Error deleting question paper:', err);
        res.status(500).json({ error: 'Failed to delete question paper' });
    }
};

// Add section to question paper
exports.addSection = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { sectionName, sectionInstructions, marks, questions } = req.body;

    if (!sectionName) {
        return res.status(400).json({ error: 'Section name is required' });
    }

    try {
        const paper = await QuestionPaper.findOne({ _id: id, schoolId });

        if (!paper) {
            return res.status(404).json({ error: 'Question paper not found' });
        }

        paper.sections.push({
            sectionName,
            sectionInstructions,
            marks,
            questions: questions || []
        });

        await paper.save();

        res.json({ message: 'Section added successfully', data: paper });
    } catch (err) {
        console.error('Error adding section:', err);
        res.status(500).json({ error: 'Failed to add section' });
    }
};

// Add question to section
exports.addQuestion = async (req, res) => {
    const { schoolId } = req.user;
    const { id, sectionIndex } = req.params;
    const questionData = req.body;

    try {
        const paper = await QuestionPaper.findOne({ _id: id, schoolId });

        if (!paper) {
            return res.status(404).json({ error: 'Question paper not found' });
        }

        if (sectionIndex >= paper.sections.length) {
            return res.status(404).json({ error: 'Section not found' });
        }

        paper.sections[sectionIndex].questions.push(questionData);
        await paper.save();

        res.json({ message: 'Question added successfully', data: paper });
    } catch (err) {
        console.error('Error adding question:', err);
        res.status(500).json({ error: 'Failed to add question' });
    }
};

// Approve question paper
exports.approveQuestionPaper = async (req, res) => {
    const { schoolId, _id: userId } = req.user;
    const { id } = req.params;

    try {
        const paper = await QuestionPaper.findOne({ _id: id, schoolId });

        if (!paper) {
            return res.status(404).json({ error: 'Question paper not found' });
        }

        paper.status = 'approved';
        paper.approvedBy = userId;
        paper.approvedDate = new Date();

        await paper.save();

        res.json({ message: 'Question paper approved successfully', data: paper });
    } catch (err) {
        console.error('Error approving question paper:', err);
        res.status(500).json({ error: 'Failed to approve question paper' });
    }
};

// Publish question paper
exports.publishQuestionPaper = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const paper = await QuestionPaper.findOne({ _id: id, schoolId });

        if (!paper) {
            return res.status(404).json({ error: 'Question paper not found' });
        }

        if (paper.status !== 'approved') {
            return res.status(400).json({ error: 'Paper must be approved before publishing' });
        }

        paper.status = 'published';
        paper.publishDate = new Date();

        await paper.save();

        res.json({ message: 'Question paper published successfully', data: paper });
    } catch (err) {
        console.error('Error publishing question paper:', err);
        res.status(500).json({ error: 'Failed to publish question paper' });
    }
};

// Get question papers by subject
exports.getQuestionPapersBySubject = async (req, res) => {
    const { schoolId } = req.user;
    const { subject } = req.params;

    try {
        const papers = await QuestionPaper.find({
            schoolId,
            subject,
            status: 'published'
        })
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json(papers);
    } catch (err) {
        console.error('Error fetching papers by subject:', err);
        res.status(500).json({ error: 'Failed to fetch question papers' });
    }
};

// Get question paper statistics
exports.getQuestionPaperStats = async (req, res) => {
    const { schoolId } = req.user;

    try {
        const papers = await QuestionPaper.find({ schoolId });

        const stats = {
            total: papers.length,
            draft: papers.filter(p => p.status === 'draft').length,
            review: papers.filter(p => p.status === 'review').length,
            approved: papers.filter(p => p.status === 'approved').length,
            published: papers.filter(p => p.status === 'published').length,
            byExamType: {},
            bySubject: {}
        };

        papers.forEach(paper => {
            stats.byExamType[paper.examType] = (stats.byExamType[paper.examType] || 0) + 1;
            stats.bySubject[paper.subject] = (stats.bySubject[paper.subject] || 0) + 1;
        });

        res.json(stats);
    } catch (err) {
        console.error('Error fetching question paper stats:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};
