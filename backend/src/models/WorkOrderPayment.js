// models/WorkOrderPayment.js
const mongoose = require('mongoose');

const workOrderPaymentSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    workOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkOrder',
        required: true
    },
    paymentNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    paymentDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentType: {
        type: String,
        enum: ['advance', 'partial', 'final', 'retention', 'other'],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'cheque', 'bank-transfer', 'upi', 'dd', 'rtgs', 'neft'],
        required: true
    },
    referenceNumber: {
        type: String,
        trim: true
    },
    chequeNumber: {
        type: String,
        trim: true
    },
    chequeDate: {
        type: Date
    },
    bankName: {
        type: String,
        trim: true
    },
    bankAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankAccount'
    },
    transactionId: {
        type: String,
        trim: true
    },
    deductions: [{
        type: {
            type: String,
            enum: ['tds', 'penalty', 'damage', 'other']
        },
        amount: Number,
        description: String
    }],
    totalDeductions: {
        type: Number,
        default: 0
    },
    netAmount: {
        type: Number,
        required: true
    },
    notes: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'processed', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalDate: Date,
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

workOrderPaymentSchema.index({ schoolId: 1, paymentNumber: 1 }, { unique: true });
workOrderPaymentSchema.index({ schoolId: 1, workOrder: 1 });
workOrderPaymentSchema.index({ schoolId: 1, vendor: 1 });
workOrderPaymentSchema.index({ schoolId: 1, paymentDate: -1 });

module.exports = mongoose.model('WorkOrderPayment', workOrderPaymentSchema);
