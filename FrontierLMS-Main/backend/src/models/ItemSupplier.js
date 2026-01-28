// models/ItemSupplier.js
const mongoose = require('mongoose');

const itemSupplierSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    supplierName: {
        type: String,
        required: true,
        trim: true
    },
    supplierCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    contactPerson: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' }
    },
    gstNumber: {
        type: String,
        trim: true,
        uppercase: true
    },
    panNumber: {
        type: String,
        trim: true,
        uppercase: true
    },
    bankDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        branchName: String
    },
    paymentTerms: {
        type: String,
        enum: ['advance', 'cash', 'credit-7', 'credit-15', 'credit-30', 'credit-45', 'credit-60'],
        default: 'cash'
    },
    creditLimit: {
        type: Number,
        default: 0
    },
    outstandingBalance: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    notes: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

itemSupplierSchema.index({ schoolId: 1, supplierCode: 1 }, { unique: true });
itemSupplierSchema.index({ schoolId: 1, supplierName: 1 });

module.exports = mongoose.model('ItemSupplier', itemSupplierSchema);
