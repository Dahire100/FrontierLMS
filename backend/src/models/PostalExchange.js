const mongoose = require('mongoose');

const postalExchangeSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    fromTitle: {
        type: String,
        required: true
    },
    toTitle: {
        type: String,
        required: true
    },
    referenceNo: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    address: {
        type: String
    },
    note: {
        type: String
    },
    type: {
        type: String,
        enum: ['receive', 'dispatch'],
        required: true
    },
    attachments: [String]
}, {
    timestamps: true
});

postalExchangeSchema.index({ schoolId: 1, type: 1, date: 1 });

module.exports = mongoose.model('PostalExchange', postalExchangeSchema);
