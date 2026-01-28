const mongoose = require('mongoose');

const studentFeeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    feeType: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: Date,
    status: {
        type: String,
        enum: ['paid', 'pending', 'overdue'],
        default: 'pending'
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StudentFee', studentFeeSchema);
