const mongoose = require('mongoose');

const chequeSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  student: {
    type: String,
    required: true
  },
  chequeNo: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Cleared', 'Bounced', 'Cancelled', 'Pending'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Cheque', chequeSchema);
