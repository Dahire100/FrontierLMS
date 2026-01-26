// models/Vendor.js
const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    vendorName: {
        type: String,
        required: true,
        trim: true
    },
    vendorCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    vendorType: {
        type: String,
        enum: ['supplier', 'contractor', 'service-provider', 'manufacturer', 'distributor', 'other'],
        default: 'supplier'
    },
    contactPerson: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    alternatePhone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    website: {
        type: String,
        trim: true
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
    tinNumber: {
        type: String,
        trim: true
    },
    bankDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        branchName: String,
        accountType: {
            type: String,
            enum: ['savings', 'current'],
            default: 'current'
        }
    },
    paymentTerms: {
        type: String,
        enum: ['advance', 'cash', 'credit-7', 'credit-15', 'credit-30', 'credit-45', 'credit-60', 'credit-90'],
        default: 'cash'
    },
    creditLimit: {
        type: Number,
        default: 0
    },
    openingBalance: {
        type: Number,
        default: 0
    },
    currentBalance: {
        type: Number,
        default: 0
    },
    categories: [{
        type: String,
        trim: true
    }],
    products: [{
        type: String,
        trim: true
    }],
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    contractStartDate: Date,
    contractEndDate: Date,
    documents: [{
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    notes: String,
    isActive: {
        type: Boolean,
        default: true
    },
    isBlacklisted: {
        type: Boolean,
        default: false
    },
    blacklistReason: String
}, {
    timestamps: true
});

vendorSchema.index({ schoolId: 1, vendorCode: 1 }, { unique: true });
vendorSchema.index({ schoolId: 1, vendorName: 1 });
vendorSchema.index({ schoolId: 1, vendorType: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
