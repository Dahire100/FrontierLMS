// models/Notice.js
const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['general', 'urgent', 'holiday', 'exam', 'event', 'circular'],
    default: 'general'
  },
  publishedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  targetAudience: {
    type: [String],
    enum: ['all', 'students', 'teachers', 'parents', 'staff'],
    default: ['all']
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

noticeSchema.index({ schoolId: 1, publishedDate: -1 });
noticeSchema.index({ schoolId: 1, isPinned: -1, publishedDate: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
