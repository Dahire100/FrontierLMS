// models/Certificate.js
const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
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
  certificateType: {
    type: String,
    required: true,
    enum: ['achievement', 'participation', 'conduct', 'completion', 'merit', 'attendance', 'sports', 'other']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  certificateNumber: {
    type: String,
    required: true
  },
  issuedBy: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  }
}, {
  timestamps: true
});

certificateSchema.index({ schoolId: 1, studentId: 1 });
certificateSchema.index({ certificateNumber: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
