// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['academic', 'sports', 'cultural', 'holiday', 'exam', 'meeting', 'trip', 'celebration', 'other']
  },
  eventDate: {
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
  venue: {
    type: String,
    required: true
  },
  organizer: {
    type: String
  },
  targetAudience: [{
    type: String,
    enum: ['all', 'students', 'teachers', 'parents', 'staff']
  }],
  eligibleClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  maxParticipants: {
    type: Number
  },
  registeredParticipants: [{
    participantId: {
      type: mongoose.Schema.Types.ObjectId
    },
    participantType: {
      type: String,
      enum: ['student', 'teacher', 'parent']
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled', 'pending'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

eventSchema.index({ schoolId: 1, eventDate: -1 });
eventSchema.index({ schoolId: 1, status: 1 });

module.exports = mongoose.model('Event', eventSchema);
