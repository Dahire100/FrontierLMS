const mongoose = require('mongoose');

const feeDiscountSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    discountCode: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: String
}, {
    timestamps: true
});

feeDiscountSchema.index({ schoolId: 1, discountCode: 1 }, { unique: true });

module.exports = mongoose.model('FeeDiscount', feeDiscountSchema);
