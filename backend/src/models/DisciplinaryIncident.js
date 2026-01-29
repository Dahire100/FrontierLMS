const mongoose = require('mongoose');

const disciplinaryIncidentSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    incidentDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    location: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    description: {
        type: String,
        required: true
    },
    actionTaken: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'investigating', 'resolved', 'dismissed'],
        default: 'pending'
    },
    remarks: {
        type: String
    }
}, {
    timestamps: true
});

disciplinaryIncidentSchema.index({ schoolId: 1, studentId: 1 });
disciplinaryIncidentSchema.index({ schoolId: 1, reportedBy: 1 });

module.exports = mongoose.model('DisciplinaryIncident', disciplinaryIncidentSchema);
