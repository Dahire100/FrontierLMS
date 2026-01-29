// models/WorkOrder.js
const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    workOrderNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    workOrderDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    workType: {
        type: String,
        enum: ['repair', 'maintenance', 'installation', 'construction', 'renovation', 'service', 'supply', 'other'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    location: {
        type: String,
        trim: true
    },
    items: [{
        description: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        },
        unit: {
            type: String,
            default: 'nos'
        },
        rate: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    }],
    laborCharges: {
        type: Number,
        default: 0
    },
    materialCost: {
        type: Number,
        default: 0
    },
    otherCharges: {
        type: Number,
        default: 0
    },
    subtotal: {
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
    grandTotal: {
        type: Number,
        required: true
    },
    advancePaid: {
        type: Number,
        default: 0
    },
    balanceAmount: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date
    },
    expectedEndDate: {
        type: Date
    },
    actualEndDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'in-progress', 'on-hold', 'completed', 'cancelled', 'closed'],
        default: 'draft'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalDate: Date,
    remarks: String,
    termsAndConditions: String,
    attachments: [{
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

workOrderSchema.index({ schoolId: 1, workOrderNumber: 1 }, { unique: true });
workOrderSchema.index({ schoolId: 1, vendor: 1 });
workOrderSchema.index({ schoolId: 1, status: 1 });
workOrderSchema.index({ schoolId: 1, workOrderDate: -1 });

module.exports = mongoose.model('WorkOrder', workOrderSchema);
