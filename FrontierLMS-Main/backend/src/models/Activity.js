// models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    className: {
        type: String,
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    section: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    activityName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Scholastic', 'Non-Scholastic'],
        default: 'Scholastic'
    },
    description: {
        type: String
    },
    academicYear: {
        type: String,
        default: () => new Date().getFullYear().toString()
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
activitySchema.index({ schoolId: 1, className: 1, section: 1 });
activitySchema.index({ schoolId: 1, subject: 1 });

module.exports = mongoose.model('Activity', activitySchema);
