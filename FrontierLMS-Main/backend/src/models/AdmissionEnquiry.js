const mongoose = require('mongoose');

const admissionEnquirySchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    address: {
        type: String
    },
    description: {
        type: String
    },
    note: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    nextFollowUpDate: {
        type: Date
    },
    source: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'passive', 'dead', 'won', 'lost'],
        default: 'active'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    dob: {
        type: Date
    },
    noOfChild: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

admissionEnquirySchema.index({ schoolId: 1, status: 1 });
admissionEnquirySchema.index({ schoolId: 1, date: 1 });

module.exports = mongoose.model('AdmissionEnquiry', admissionEnquirySchema);
