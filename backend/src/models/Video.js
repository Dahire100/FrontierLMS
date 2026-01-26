// models/Video.js
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
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
    videoUrl: {
        type: String,
        required: true
    },
    videoType: {
        type: String,
        enum: ['youtube', 'vimeo', 'direct', 'other'],
        default: 'youtube'
    },
    thumbnailUrl: {
        type: String
    },
    duration: {
        type: Number // in seconds
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
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FileCategory'
    },
    tags: [{
        type: String
    }],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    viewCount: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    visibleToRoles: [{
        type: String,
        enum: ['student', 'teacher', 'parent', 'admin', 'all']
    }]
}, {
    timestamps: true
});

// Indexes
videoSchema.index({ schoolId: 1, classId: 1 });
videoSchema.index({ schoolId: 1, isPublished: 1 });
videoSchema.index({ tags: 1 });

module.exports = mongoose.model('Video', videoSchema);
