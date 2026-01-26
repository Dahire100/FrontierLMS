// models/ItemCategory.js
const mongoose = require('mongoose');

const itemCategorySchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    categoryName: {
        type: String,
        required: true,
        trim: true
    },
    categoryCode: {
        type: String,
        trim: true,
        uppercase: true
    },
    description: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

itemCategorySchema.index({ schoolId: 1, categoryName: 1 }, { unique: true });

module.exports = mongoose.model('ItemCategory', itemCategorySchema);
