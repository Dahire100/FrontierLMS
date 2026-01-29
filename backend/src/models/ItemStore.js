// models/ItemStore.js
const mongoose = require('mongoose');

const itemStoreSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    storeName: {
        type: String,
        required: true,
        trim: true
    },
    storeCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    description: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    inCharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    contactNumber: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

itemStoreSchema.index({ schoolId: 1, storeCode: 1 }, { unique: true });

module.exports = mongoose.model('ItemStore', itemStoreSchema);
