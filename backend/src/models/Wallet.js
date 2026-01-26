// models/Wallet.js
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['active', 'blocked', 'closed'],
        default: 'active'
    },
    pin: String, // Encrypted 4-digit PIN for transactions
    transactions: [{
        txId: { type: String, required: true },
        type: { type: String, enum: ['credit', 'debit'], required: true },
        category: {
            type: String,
            enum: ['recharge', 'fee_payment', 'canteen', 'library_fine', 'transport', 'refund', 'other'],
            required: true
        },
        amount: { type: Number, required: true },
        description: String,
        date: { type: Date, default: Date.now },
        balanceAfter: Number,
        referenceId: String, // External gateway ID or Invoice ID
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Wallet', walletSchema);
