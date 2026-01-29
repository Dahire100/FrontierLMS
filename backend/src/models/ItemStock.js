// models/ItemStock.js
const mongoose = require('mongoose');

const itemStockSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
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
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemSupplier'
    },
    stockDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    purchasePrice: {
        type: Number,
        required: true,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    netAmount: {
        type: Number,
        required: true
    },
    invoiceNumber: {
        type: String,
        trim: true
    },
    invoiceDate: {
        type: Date
    },
    batchNumber: {
        type: String,
        trim: true
    },
    expiryDate: {
        type: Date
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid'],
        default: 'pending'
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    notes: String,
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

itemStockSchema.index({ schoolId: 1, item: 1 });
itemStockSchema.index({ schoolId: 1, store: 1 });
itemStockSchema.index({ schoolId: 1, supplier: 1 });
itemStockSchema.index({ schoolId: 1, stockDate: -1 });

module.exports = mongoose.model('ItemStock', itemStockSchema);
