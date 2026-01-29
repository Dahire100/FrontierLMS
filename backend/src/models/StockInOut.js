// models/StockInOut.js
const mongoose = require('mongoose');

const stockInOutSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    transactionNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    transactionDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    transactionType: {
        type: String,
        enum: ['in', 'out'],
        required: true
    },
    reason: {
        type: String,
        enum: ['purchase', 'return', 'adjustment', 'transfer', 'damage', 'loss', 'expired', 'donation', 'other'],
        required: true
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemStore',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    previousStock: {
        type: Number,
        required: true
    },
    currentStock: {
        type: Number,
        required: true
    },
    unitPrice: {
        type: Number,
        default: 0
    },
    totalValue: {
        type: Number,
        default: 0
    },
    referenceType: {
        type: String,
        enum: ['stock-entry', 'issue', 'sale', 'manual', 'transfer'],
        default: 'manual'
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    toStore: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemStore'
    },
    notes: String,
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

stockInOutSchema.index({ schoolId: 1, transactionNumber: 1 }, { unique: true });
stockInOutSchema.index({ schoolId: 1, transactionDate: -1 });
stockInOutSchema.index({ schoolId: 1, item: 1 });
stockInOutSchema.index({ schoolId: 1, store: 1 });
stockInOutSchema.index({ schoolId: 1, transactionType: 1 });

module.exports = mongoose.model('StockInOut', stockInOutSchema);
