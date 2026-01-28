// models/Communication.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderType: {
    type: String,
    enum: ['teacher', 'parent', 'admin', 'student', 'school_admin', 'super_admin'],
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientType: {
    type: String,
    enum: ['teacher', 'parent', 'admin', 'student', 'school_admin', 'super_admin'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

messageSchema.index({ schoolId: 1, recipientId: 1, isRead: 1 });
messageSchema.index({ schoolId: 1, senderId: 1 });

module.exports = mongoose.model('Message', messageSchema);
