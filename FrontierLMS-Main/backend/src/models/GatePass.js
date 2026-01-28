const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    issuedTo: {
        type: String,
        enum: ['Student', 'Staff'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    inTime: {
        type: String
    },
    outTime: {
        type: String
    },
    personCarrying: {
        type: String
    },
    note: {
        type: String
    },
    image: {
        type: String
    }
}, {
    timestamps: true
});

gatePassSchema.index({ schoolId: 1, startDate: 1 });

module.exports = mongoose.model('GatePass', gatePassSchema);
