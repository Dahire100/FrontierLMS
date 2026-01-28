// models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  category: {
    type: String,
    required: true
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  expenseDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  paidTo: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    default: 'cash'
  },
  receiptNumber: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    default: 'paid'
  }
}, {
  timestamps: true
});

expenseSchema.index({ schoolId: 1, expenseDate: -1 });
expenseSchema.index({ schoolId: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
