const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    institute: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Paid', 'Pending', 'Overdue'],
        default: 'Pending'
    },
    plan: {
        type: String,
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    issuedDate: {
        type: Date,
        default: Date.now
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);
