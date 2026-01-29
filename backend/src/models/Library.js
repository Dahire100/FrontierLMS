// models/Library.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
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
  author: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  bookNumber: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['fiction', 'non-fiction', 'science', 'mathematics', 'history', 'geography', 'language', 'reference', 'other']
  },
  publisher: {
    type: String,
    trim: true
  },
  publishedYear: {
    type: Number
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  availableQuantity: {
    type: Number,
    required: true,
    default: 1
  },
  rackNumber: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const issueRecordSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  issuedTo: {
    userType: {
      type: String,
      enum: ['student', 'teacher', 'staff'],
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'issuedTo.userType'
    },
    name: String,
    contactNumber: String
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['issued', 'returned', 'overdue', 'lost'],
    default: 'issued'
  },
  fineAmount: {
    type: Number,
    default: 0
  },
  remarks: {
    type: String,
    trim: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const bookRequestSchema = new mongoose.Schema({
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
  bookTitle: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'available'],
    default: 'pending'
  },
  remarks: String
}, {
  timestamps: true
});

bookSchema.index({ schoolId: 1, bookNumber: 1 }, { unique: true });
issueRecordSchema.index({ schoolId: 1, status: 1 });
issueRecordSchema.index({ 'issuedTo.userId': 1 });
bookRequestSchema.index({ schoolId: 1, studentId: 1 });

const Book = mongoose.model('Book', bookSchema);
const IssueRecord = mongoose.model('IssueRecord', issueRecordSchema);
const BookRequest = mongoose.model('BookRequest', bookRequestSchema);

module.exports = { Book, IssueRecord, BookRequest };
