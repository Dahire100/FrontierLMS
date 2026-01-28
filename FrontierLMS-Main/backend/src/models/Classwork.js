// models/Classwork.js
const mongoose = require('mongoose');

const classworkSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
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
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    assignedDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    attachments: [{
        name: String,
        url: String,
        uploadedAt: Date
    }],
    submissions: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        submittedAt: Date,
        content: String,
        attachments: [{
            name: String,
            url: String
        }],
        marks: Number,
        maxMarks: Number,
        feedback: String,
        status: {
            type: String,
            enum: ['submitted', 'graded', 'pending'],
            default: 'pending'
        }
    }],
    maxMarks: {
        type: Number,
        default: 0
    },
    isGraded: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

classworkSchema.index({ schoolId: 1, classId: 1, assignedDate: -1 });
classworkSchema.index({ schoolId: 1, teacherId: 1 });

module.exports = mongoose.model('Classwork', classworkSchema);
