const mongoose = require('mongoose');

const consentRequestSchema = new mongoose.Schema({
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
    title: { type: String, required: true },
    description: String,
    eventDate: Date,
    deadlineDate: Date,
    targetClass: {
        type: mongoose.Schema.Types.ObjectId, // Or '10a' string if not strictly linking yet
        ref: 'Class'
    },
    targetClassString: String, // fallback
    costPerStudent: Number,
    totalStudents: { type: Number, default: 0 },
    approvedCount: { type: Number, default: 0 },
    pendingCount: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['active', 'closed', 'draft'],
        default: 'active'
    },
    responses: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        status: { type: String, enum: ['approved', 'rejected', 'pending'], default: 'pending' },
        parentRemark: String,
        responseDate: Date
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('ConsentRequest', consentRequestSchema);
