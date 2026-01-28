// models/PrimaryEvaluation.js
const mongoose = require('mongoose');

const primaryEvaluationSchema = new mongoose.Schema({
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
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    evaluationType: {
        type: String,
        enum: ['formative', 'summative', 'continuous', 'project'],
        default: 'formative'
    },
    academicYear: {
        type: String,
        required: true
    },
    term: {
        type: String,
        enum: ['term-1', 'term-2', 'term-3', 'annual'],
        required: true
    },
    evaluationDate: {
        type: Date,
        default: Date.now
    },
    evaluatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    // Skill-based evaluation for primary students
    skills: [{
        skillName: {
            type: String,
            required: true // e.g., Reading, Writing, Speaking, Listening, etc.
        },
        category: {
            type: String,
            enum: ['language', 'mathematics', 'science', 'social', 'arts', 'physical', 'general']
        },
        rating: {
            type: String,
            enum: ['excellent', 'very-good', 'good', 'satisfactory', 'needs-improvement'],
            required: true
        },
        score: {
            type: Number, // Optional numeric score
            min: 0,
            max: 100
        },
        remarks: String
    }],
    // Behavioral assessment
    behavior: {
        discipline: {
            type: String,
            enum: ['excellent', 'very-good', 'good', 'satisfactory', 'needs-improvement']
        },
        participation: {
            type: String,
            enum: ['excellent', 'very-good', 'good', 'satisfactory', 'needs-improvement']
        },
        cooperation: {
            type: String,
            enum: ['excellent', 'very-good', 'good', 'satisfactory', 'needs-improvement']
        },
        punctuality: {
            type: String,
            enum: ['excellent', 'very-good', 'good', 'satisfactory', 'needs-improvement']
        }
    },
    // Overall assessment
    overallGrade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'E']
    },
    overallRemarks: String,
    strengths: [String],
    areasOfImprovement: [String],
    teacherComments: String,
    // Co-curricular activities
    coCurricular: [{
        activity: String,
        performance: {
            type: String,
            enum: ['excellent', 'very-good', 'good', 'satisfactory', 'needs-improvement']
        }
    }],
    attendance: {
        totalDays: Number,
        presentDays: Number,
        percentage: Number
    },
    isFinalized: {
        type: Boolean,
        default: false
    },
    finalizedDate: Date
}, {
    timestamps: true
});

primaryEvaluationSchema.index({ schoolId: 1, studentId: 1, academicYear: 1, term: 1 });
primaryEvaluationSchema.index({ schoolId: 1, classId: 1, subject: 1 });

module.exports = mongoose.model('PrimaryEvaluation', primaryEvaluationSchema);
