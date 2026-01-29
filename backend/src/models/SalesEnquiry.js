const mongoose = require('mongoose');

const salesEnquirySchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    institute: {
        type: String,
        required: true
    },
    website: String,
    solution: String,
    message: String,
    status: {
        type: String,
        enum: ['new', 'contacted', 'converted', 'closed'],
        default: 'new'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SalesEnquiry', salesEnquirySchema);
