const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    schoolName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pinCode: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    principalName: { type: String, required: true },
    principalEmail: { type: String, required: true },
    principalPhone: { type: String, required: true },
    schoolType: { type: String, required: true },
    type: { type: String, default: 'School' },
    boardType: { type: String, required: true },
    establishmentYear: { type: String, required: true },
    description: { type: String, required: true },
    totalStudents: { type: Number },
    totalTeachers: { type: Number },
    logo: { type: String }, // URL to the logo
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'suspended'],
        default: 'pending'
    },
    adminEmail: String,
    adminPassword: String, // Note: Should be hashed in production, but keeping consistent with existing schema
    registrationDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('School', schoolSchema);
