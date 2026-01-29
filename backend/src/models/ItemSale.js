// models/ItemSale.js
const mongoose = require('mongoose');

const itemSaleSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    saleNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    saleDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    customerType: {
        type: String,
        enum: ['student', 'parent', 'staff', 'external', 'other'],
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'customerModel'
    },
    customerModel: {
        type: String,
        enum: ['Student', 'User', 'Staff']
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerPhone: {
        type: String,
        trim: true
    },
    customerEmail: {
        type: String,
        trim: true,
        lowercase: true
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
            required: true,
            min: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        tax: {
            type: Number,
            default: 0
        },
        totalPrice: {
            type: Number,
            required: true
        }
    }],
    subtotal: {
        type: Number,
        required: true
    },
    totalDiscount: {
        type: Number,
        default: 0
    },
    totalTax: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    dueAmount: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'cheque', 'bank-transfer', 'wallet', 'credit'],
        default: 'cash'
    },
    notes: String,
    soldBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

itemSaleSchema.index({ schoolId: 1, saleNumber: 1 }, { unique: true });
itemSaleSchema.index({ schoolId: 1, saleDate: -1 });
itemSaleSchema.index({ schoolId: 1, customerType: 1 });
itemSaleSchema.index({ schoolId: 1, paymentStatus: 1 });

module.exports = mongoose.model('ItemSale', itemSaleSchema);
