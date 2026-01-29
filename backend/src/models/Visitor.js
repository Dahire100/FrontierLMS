const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    idCard: {
        type: String
    },
    noOfPerson: {
        type: Number,
        default: 1
    },
    date: {
        type: Date,
        default: Date.now
    },
    inTime: {
        type: String
    },
    outTime: {
        type: String
    },
    note: {
        type: String
    },
    attachments: [String]
}, {
    timestamps: true
});

visitorSchema.index({ schoolId: 1, date: 1 });

module.exports = mongoose.model('Visitor', visitorSchema);
