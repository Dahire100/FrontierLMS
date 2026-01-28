const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    rollNumber: Number,
    admissionDate: Date,
    dateOfBirth: Date,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    category: String,
    religion: String,
    caste: String,
    bloodGroup: String,

    // Contact & Address
    address: String, // Current Address
    permanentAddress: String,
    phone: String,
    email: String,

    // Identification
    aadharNumber: String,
    biometricId: String,
    nationalId: String,
    localId: String,

    // Physical
    height: String,
    weight: String,

    // Parent/Guardian
    parentName: String, // Primary Contact Name
    parentPhone: String,
    parentEmail: String,
    fatherName: String,
    fatherPhone: String,
    fatherOccupation: String,
    motherName: String,
    motherPhone: String,
    motherOccupation: String,
    guardianName: String,
    guardianPhone: String,
    guardianRelation: String,
    guardianOccupation: String,
    guardianAddress: String,

    fatherPhoto: String,
    motherPhoto: String,
    guardianPhoto: String,

    // Academic & History
    previousSchoolName: String,
    previousSchoolMarks: String,
    previousClass: String,

    // Banking
    bankAccountNo: String,
    bankName: String,
    ifscCode: String,
    rte: { type: String, default: 'no' },

    // Others
    transportRoute: String,
    hostelName: String,
    roomNumber: String,
    note: String,

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    profilePicture: String,
    documents: [{
        title: String,
        url: String
    }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    isActive: { type: Boolean, default: true },
    resultStatus: {
        type: String,
        enum: ['PASS', 'FAIL', 'PENDING'],
        default: 'PENDING'
    },
    isPromoted: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
