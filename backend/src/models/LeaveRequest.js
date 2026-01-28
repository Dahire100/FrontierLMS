// models/LeaveRequest.js
const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  requesterType: {
    type: String,
    enum: ['teacher', 'student', 'staff', 'parent'],
    required: true
  },
  leaveType: {
    type: String,
    enum: ['sick', 'casual', 'emergency', 'vacation', 'medical', 'other'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  approvalRemarks: {
    type: String,
    trim: true
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

leaveRequestSchema.index({ schoolId: 1, requesterId: 1, status: 1 });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
