// models/LessonPlan.js
const mongoose = require('mongoose');

const lessonPlanSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  lessonDate: {
    type: Date,
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  objectives: {
    type: [String],
    default: []
  },
  activities: {
    type: String,
    trim: true
  },
  resources: {
    type: String,
    trim: true
  },
  homework: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  duration: {
    type: Number, // in minutes
    default: 45
  }
}, {
  timestamps: true
});

lessonPlanSchema.index({ schoolId: 1, teacherId: 1, lessonDate: 1 });

module.exports = mongoose.model('LessonPlan', lessonPlanSchema);
