const EntranceExam = require('../models/EntranceExam');

exports.getAllExams = async (req, res) => {
    try {
        const exams = await EntranceExam.find({ schoolId: req.user.schoolId }).sort({ createdAt: -1 });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getExamById = async (req, res) => {
    try {
        const exam = await EntranceExam.findOne({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!exam) return res.status(404).json({ message: 'Exam entry not found' });
        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createExam = async (req, res) => {
    try {
        const examData = {
            ...req.body,
            schoolId: req.user.schoolId
        };
        const newExam = new EntranceExam(examData);
        await newExam.save();
        res.status(201).json(newExam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateExam = async (req, res) => {
    try {
        const exam = await EntranceExam.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!exam) return res.status(404).json({ message: 'Exam entry not found' });
        res.json(exam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteExam = async (req, res) => {
    try {
        const exam = await EntranceExam.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!exam) return res.status(404).json({ message: 'Exam entry not found' });
        res.json({ message: 'Exam entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
