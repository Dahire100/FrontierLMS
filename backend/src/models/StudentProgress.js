// models/StudentProgress.js
const mongoose = require('mongoose');

const studentProgressSchema = new mongoose.Schema({
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
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    enum: ['term1', 'term2', 'term3', 'annual'],
    required: true
  },
  subjects: [{
    subjectName: String,
    marks: Number,
    totalMarks: Number,
    grade: String,
    remarks: String
  }],
  overallGrade: {
    type: String,
    trim: true
  },
  overallPercentage: {
    type: Number
  },
  rank: {
    type: Number
  },
  attendance: {
    present: Number,
    absent: Number,
    total: Number,
    percentage: Number
  },
  teacherRemarks: {
    type: String,
    trim: true
  },
  principalRemarks: {
    type: String,
    trim: true
  },
  strengths: [{
    type: String,
    trim: true
  }],
  areasOfImprovement: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

studentProgressSchema.index({ schoolId: 1, studentId: 1, academicYear: 1, term: 1 });

module.exports = mongoose.model('StudentProgress', studentProgressSchema);
