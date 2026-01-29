// models/Syllabus.js
const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    section: {
        type: String
    },
    subject: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    term: {
        type: String,
        enum: ['Term 1', 'Term 2', 'Annual', 'Half-Yearly'],
        default: 'Annual'
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileType: {
        type: String
    },
    fileSize: {
        type: Number
    },
    topics: [{
        title: String,
        description: String,
        order: Number
    }],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
syllabusSchema.index({ schoolId: 1, classId: 1, subject: 1 });
syllabusSchema.index({ schoolId: 1, academicYear: 1 });

module.exports = mongoose.model('Syllabus', syllabusSchema);
