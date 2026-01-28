const mongoose = require('mongoose');

const documentMasterSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    belongsTo: {
        type: String,
        enum: ['student', 'staff'],
        required: true
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DocumentMaster', documentMasterSchema);
