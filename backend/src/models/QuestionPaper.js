// models/QuestionPaper.js
const mongoose = require('mongoose');

const questionPaperSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    class: {
        type: String,
        required: true
    },
    section: String,
    examType: {
        type: String,
        enum: ['unit-test', 'monthly', 'quarterly', 'half-yearly', 'annual', 'practice'],
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    instructions: String,
    academicYear: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    sections: [{
        sectionName: {
            type: String,
            required: true // e.g., "Section A", "Part I"
        },
        sectionInstructions: String,
        marks: Number,
        questions: [{
            questionNumber: Number,
            questionText: {
                type: String,
                required: true
            },
            questionType: {
                type: String,
                enum: ['mcq', 'short-answer', 'long-answer', 'true-false', 'fill-blanks', 'match'],
                default: 'short-answer'
            },
            marks: {
                type: Number,
                required: true
            },
            options: [String], // For MCQ
            correctAnswer: String, // For MCQ or true-false
            images: [{
                url: String,
                caption: String
            }],
            hints: String
        }]
    }],
    status: {
        type: String,
        enum: ['draft', 'review', 'approved', 'published'],
        default: 'draft'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedDate: Date,
    publishDate: Date,
    fileUrl: String, // PDF or document link
    answerKeyUrl: String,
    tags: [String],
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

questionPaperSchema.index({ schoolId: 1, subject: 1, class: 1 });
questionPaperSchema.index({ schoolId: 1, academicYear: 1 });
questionPaperSchema.index({ schoolId: 1, status: 1 });

module.exports = mongoose.model('QuestionPaper', questionPaperSchema);
