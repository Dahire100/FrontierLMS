const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    thumbnail: {
        type: String, // Cover image
    },
    images: [{
        url: String,
        caption: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

gallerySchema.index({ schoolId: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);
