// models/Quiz.js
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
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
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  passingMarks: {
    type: Number,
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String
    }],
    correctAnswer: {
      type: String,
      required: true
    },
    marks: {
      type: Number,
      required: true
    }
  }],
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
  attempts: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    startedAt: {
      type: Date
    },
    submittedAt: {
      type: Date
    },
    answers: [{
      questionIndex: Number,
      answer: String
    }],
    score: {
      type: Number
    },
    percentage: {
      type: Number
    },
    result: {
      type: String,
      enum: ['pass', 'fail']
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed'],
    default: 'draft'
  }
}, {
  timestamps: true
});

quizSchema.index({ schoolId: 1, classId: 1, scheduledDate: -1 });
quizSchema.index({ schoolId: 1, teacherId: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
