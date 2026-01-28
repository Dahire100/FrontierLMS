const mongoose = require('mongoose');

const cmsPageSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    content: {
        type: String, // HTML content
        required: false
    },
    metaTitle: {
        type: String
    },
    metaDescription: {
        type: String
    },
    status: {
        type: String,
        enum: ['Published', 'Draft', 'Scheduled'],
        default: 'Draft'
    },
    author: {
        type: String,
        default: 'Admin' // formatted as "Name (Role)" or just "Name"
    },
    publishDate: {
        type: Date
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

cmsPageSchema.index({ schoolId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('CMSPage', cmsPageSchema);
