// models/Complaint.js
const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  complainantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  complainantName: {
    type: String,
    required: true
  },
  complainantType: {
    type: String,
    required: true,
    enum: ['student', 'parent', 'teacher', 'staff', 'visitor', 'other']
  },
  complaintType: {
    type: String,
    required: true,
    enum: ['academic', 'discipline', 'facility', 'transport', 'fee', 'discrimination', 'bullying', 'other']
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  attachments: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed', 'rejected'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  response: {
    type: String
  },
  responseDate: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedDate: {
    type: Date
  },
  resolutionNotes: {
    type: String
  }
}, {
  timestamps: true
});

complaintSchema.index({ schoolId: 1, complainantId: 1 });
complaintSchema.index({ schoolId: 1, status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
