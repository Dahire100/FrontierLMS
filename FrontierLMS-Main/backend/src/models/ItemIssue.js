// models/ItemIssue.js
const mongoose = require('mongoose');

const itemIssueSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    issueNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    issueDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    issueTo: {
        type: String,
        enum: ['student', 'teacher', 'staff', 'department', 'class', 'other'],
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        enum: ['Student', 'Teacher', 'Staff', 'Department', 'Class', 'User']
    },
    recipientName: {
        type: String,
        trim: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemStore',
        required: true
    },
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inventory',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            default: 0
        },
        totalPrice: {
            type: Number,
            default: 0
        },
        returnedQuantity: {
            type: Number,
            default: 0
        },
        returnDate: Date
    }],
    totalAmount: {
        type: Number,
        default: 0
    },
    purpose: {
        type: String,
        trim: true
    },
    expectedReturnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['issued', 'partially-returned', 'returned', 'cancelled'],
        default: 'issued'
    },
    notes: String,
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

itemIssueSchema.index({ schoolId: 1, issueNumber: 1 }, { unique: true });
itemIssueSchema.index({ schoolId: 1, issueDate: -1 });
itemIssueSchema.index({ schoolId: 1, issueTo: 1 });
itemIssueSchema.index({ schoolId: 1, status: 1 });

module.exports = mongoose.model('ItemIssue', itemIssueSchema);
