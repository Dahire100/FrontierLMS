const mongoose = require('mongoose');

const recruitmentSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date },
    status: { type: String, enum: ['pending', 'scheduled', 'interviewed', 'offered', 'rejected', 'joined'], default: 'pending' },
    interviewDate: { type: Date },
    expectedSalary: { type: Number },
    workStatus: { type: String }, // e.g. "Experience", "Fresher"
    maritalStatus: { type: String },
    resumeUrl: { type: String },
    submissionDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Recruitment', recruitmentSchema);
