const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    question: {
        type: String,
        required: true
    },
    questionType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuestionType'
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    subject: {
        type: String, // Or Subject ref if you have it
        required: true
    },
    section: String,
    level: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    marks: {
        type: Number,
        default: 1
    },
    options: [String], // For MCQ
    correctAnswer: String // For MCQ/One-word
}, { timestamps: true });

module.exports = mongoose.model('QuestionBank', questionBankSchema);
