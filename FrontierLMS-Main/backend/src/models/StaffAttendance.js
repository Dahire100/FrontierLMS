const mongoose = require('mongoose');

const staffAttendanceSchema = new mongoose.Schema({
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'late', 'half_day'], required: true },
    remarks: { type: String, trim: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index to prevent duplicate attendance for same staff on same day
staffAttendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('StaffAttendance', staffAttendanceSchema);
