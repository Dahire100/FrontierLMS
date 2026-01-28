// models/OnlineClass.js
const mongoose = require('mongoose');

const onlineClassSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  meetingLink: {
    type: String,
    required: true,
    trim: true
  },
  meetingId: {
    type: String,
    trim: true
  },
  meetingPassword: {
    type: String,
    trim: true
  },
  platform: {
    type: String,
    enum: ['zoom', 'google-meet', 'microsoft-teams', 'other'],
    default: 'zoom'
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  recordingUrl: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  attendance: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    joinedAt: Date,
    leftAt: Date,
    duration: Number // in minutes
  }]
}, {
  timestamps: true
});

onlineClassSchema.index({ schoolId: 1, classId: 1, scheduledDate: 1 });
onlineClassSchema.index({ schoolId: 1, teacherId: 1 });

module.exports = mongoose.model('OnlineClass', onlineClassSchema);
