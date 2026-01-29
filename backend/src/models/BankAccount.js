// models/BankAccount.js
const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    accountName: {
        type: String,
        required: true,
        trim: true
    },
    accountNumber: {
        type: String,
        required: true,
        trim: true
    },
    bankName: {
        type: String,
        required: true,
        trim: true
    },
    branchName: {
        type: String,
        required: true,
        trim: true
    },
    ifscCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    accountType: {
        type: String,
        enum: ['savings', 'current', 'fixed_deposit', 'recurring_deposit'],
        default: 'current'
    },
    openingBalance: {
        type: Number,
        default: 0
    },
    currentBalance: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isPrimary: {
        type: Boolean,
        default: false
    },
    contactPerson: {
        name: String,
        phone: String,
        email: String
    },
    transactions: [{
        date: {
            type: Date,
            default: Date.now
        },
        type: {
            type: String,
            enum: ['credit', 'debit'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        description: String,
        reference: String,
        balanceAfter: Number
    }],
    lastReconciliationDate: Date,
    notes: String
}, {
    timestamps: true
});

bankAccountSchema.index({ schoolId: 1, accountNumber: 1 }, { unique: true });
bankAccountSchema.index({ schoolId: 1, isActive: 1 });

module.exports = mongoose.model('BankAccount', bankAccountSchema);
