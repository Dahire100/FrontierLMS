// models/ItemSet.js
const mongoose = require('mongoose');

const itemSetSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    setName: {
        type: String,
        required: true,
        trim: true
    },
    setCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    description: {
        type: String,
        trim: true
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
        }
    }],
    totalPrice: {
        type: Number,
        default: 0
    },
    sellingPrice: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        enum: ['classroom-kit', 'lab-kit', 'sports-kit', 'office-kit', 'cleaning-kit', 'maintenance-kit', 'other'],
        default: 'other'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

itemSetSchema.index({ schoolId: 1, setCode: 1 }, { unique: true });

module.exports = mongoose.model('ItemSet', itemSetSchema);
