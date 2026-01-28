// models/DownloadContent.js
const mongoose = require('mongoose');

const downloadContentSchema = new mongoose.Schema({
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
    contentType: {
        type: String,
        enum: ['assignment', 'study-material', 'syllabus', 'other-download', 'video'],
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FileCategory'
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    section: {
        type: String
    },
    subject: {
        type: String
    },
    fileUrl: {
        type: String
    },
    videoUrl: {
        type: String
    },
    videoType: {
        type: String,
        enum: ['youtube', 'vimeo', 'uploaded', 'url'],
        default: 'uploaded'
    },
    fileSize: {
        type: Number // in bytes
    },
    fileType: {
        type: String // pdf, doc, ppt, etc.
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    visibleToRoles: [{
        type: String,
        enum: ['student', 'teacher', 'parent', 'admin']
    }],
    dueDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    publishDate: {
        type: Date
    },
    tags: [{
        type: String
    }],
    academicYear: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for better query performance
downloadContentSchema.index({ schoolId: 1, contentType: 1 });
downloadContentSchema.index({ schoolId: 1, classId: 1 });
downloadContentSchema.index({ schoolId: 1, isActive: 1, isPublished: 1 });

module.exports = mongoose.model('DownloadContent', downloadContentSchema);
