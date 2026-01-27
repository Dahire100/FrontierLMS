const mongoose = require('mongoose');

const admitCardSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    generatedDate: {
        type: Date,
        default: Date.now
    },
    cardUrl: {
        type: String // If we store a generated PDF link, otherwise generated on fly
    },
    examCenter: {
        type: String
    },
    seatNumber: {
        type: String
    },
    subjects: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['active', 'revoked'],
        default: 'active'
    }
}, { timestamps: true });

admitCardSchema.index({ studentId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model('AdmitCard', admitCardSchema);
