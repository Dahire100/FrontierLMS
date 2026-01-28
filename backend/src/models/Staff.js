// models/Staff.js
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    staffId: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    alternatePhone: String,
    dateOfBirth: Date,
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    bloodGroup: String,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    role: {
        type: String,
        enum: ['admin', 'accountant', 'librarian', 'receptionist', 'security', 'maintenance', 'other'],
        required: true
    },
    department: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    dateOfJoining: {
        type: Date,
        required: true
    },
    employmentType: {
        type: String,
        enum: ['permanent', 'contract', 'part-time', 'temporary'],
        default: 'permanent'
    },
    salary: {
        basicSalary: Number,
        allowances: Number,
        deductions: Number,
        netSalary: Number
    },
    bankDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        branch: String
    },
    qualifications: [{
        degree: String,
        institution: String,
        year: Number
    }],
    experience: {
        years: Number,
        previousOrganizations: [{
            name: String,
            position: String,
            duration: String
        }]
    },
    documents: [{
        type: String,
        url: String,
        uploadedAt: Date
    }],
    emergencyContact: {
        name: String,
        relation: String,
        phone: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

staffSchema.index({ schoolId: 1, staffId: 1 }, { unique: true });
staffSchema.index({ schoolId: 1, email: 1 });
staffSchema.index({ schoolId: 1, role: 1 });

module.exports = mongoose.model('Staff', staffSchema);
