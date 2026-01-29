// models/HostelOutpass.js
const mongoose = require('mongoose');

const hostelOutpassSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true },
    parentContact: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: String
}, { timestamps: true });

hostelOutpassSchema.index({ schoolId: 1, studentId: 1 });

module.exports = mongoose.model('HostelOutpass', hostelOutpassSchema);
