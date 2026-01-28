// models/Inventory.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    itemCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    category: {
        type: String,
        required: true
    },
    itemCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemCategory'
    },
    itemStore: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemStore'
    },
    itemSupplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemSupplier'
    },
    description: String,
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    unit: {
        type: String,
        default: 'pieces'
    },
    minimumStock: {
        type: Number,
        default: 10
    },
    location: String,
    supplier: {
        name: String,
        contact: String,
        email: String
    },
    purchasePrice: {
        type: Number,
        default: 0
    },
    sellingPrice: {
        type: Number,
        default: 0
    },
    purchaseDate: Date,
    warrantyExpiry: Date,
    condition: {
        type: String,
        enum: ['new', 'good', 'fair', 'poor', 'damaged'],
        default: 'new'
    },
    status: {
        type: String,
        enum: ['available', 'in-use', 'under-maintenance', 'damaged', 'disposed'],
        default: 'available'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedDate: Date,
    transactions: [{
        date: {
            type: Date,
            default: Date.now
        },
        type: {
            type: String,
            enum: ['purchase', 'issue', 'return', 'damaged', 'disposed'],
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: String,
        balanceAfter: Number
    }],
    images: [{
        url: String,
        uploadedAt: Date
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

inventorySchema.index({ schoolId: 1, itemCode: 1 }, { unique: true });
inventorySchema.index({ schoolId: 1, category: 1 });
inventorySchema.index({ schoolId: 1, status: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
