// models/FileCategory.js
const mongoose = require('mongoose');

const fileCategorySchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    categoryType: {
        type: String,
        enum: ['assignment', 'study-material', 'syllabus', 'video', 'other'],
        required: true
    },
    icon: {
        type: String
    },
    color: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes
fileCategorySchema.index({ schoolId: 1, categoryType: 1 });
fileCategorySchema.index({ name: 1, schoolId: 1 }, { unique: true });

module.exports = mongoose.model('FileCategory', fileCategorySchema);
