// models/SoldItemPayment.js
const mongoose = require('mongoose');

const soldItemPaymentSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemSale',
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
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'cheque', 'bank-transfer', 'wallet'],
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
    transactionId: {
        type: String,
        trim: true
    },
    notes: String,
    receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'completed'
    }
}, {
    timestamps: true
});

soldItemPaymentSchema.index({ schoolId: 1, paymentNumber: 1 }, { unique: true });
soldItemPaymentSchema.index({ schoolId: 1, sale: 1 });
soldItemPaymentSchema.index({ schoolId: 1, paymentDate: -1 });

module.exports = mongoose.model('SoldItemPayment', soldItemPaymentSchema);
