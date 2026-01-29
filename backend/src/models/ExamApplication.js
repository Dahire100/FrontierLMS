const mongoose = require('mongoose');

const examApplicationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam', // Assuming Exam model exists
        required: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    applicationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    remarks: {
        type: String
    },
    selectedSubjects: [{
        type: String // or Object ID if subjects are a separate model, for now string names
    }],
    examFee: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentId: {
        type: String
    }
}, { timestamps: true });

// Prevent duplicate applications
examApplicationSchema.index({ studentId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model('ExamApplication', examApplicationSchema);
