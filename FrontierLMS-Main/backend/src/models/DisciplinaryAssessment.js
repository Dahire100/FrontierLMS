const mongoose = require('mongoose');

const disciplinaryAssessmentSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    month: {
        type: String, // e.g. "January" or "2024-01"
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    scores: [{
        parameterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DisciplinaryParameter'
        },
        score: {
            type: Number,
            min: 0,
            max: 10
        },
        remarks: String
    }],
    totalScore: Number,
    averageScore: Number,
    teacherRemarks: String,
    assessedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

disciplinaryAssessmentSchema.index({ schoolId: 1, studentId: 1, month: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('DisciplinaryAssessment', disciplinaryAssessmentSchema);
