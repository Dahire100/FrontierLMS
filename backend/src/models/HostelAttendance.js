// models/HostelAttendance.js
const mongoose = require('mongoose');

const hostelAttendanceSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    hostelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'leave'],
        default: 'present'
    },
    remarks: {
        type: String,
        trim: true
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

hostelAttendanceSchema.index({ schoolId: 1, hostelId: 1, date: 1 });
hostelAttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HostelAttendance', hostelAttendanceSchema);
