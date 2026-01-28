const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['image', 'video', 'text', 'pdf', 'document', 'other'],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String
    },
    size: {
        type: Number // in bytes
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

mediaSchema.index({ schoolId: 1, type: 1 });

module.exports = mongoose.model('Media', mediaSchema);
