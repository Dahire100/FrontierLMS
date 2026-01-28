const mongoose = require('mongoose');

const bannerImageSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    link: {
        type: String // Optional link when clicked
    },
    description: {
        type: String
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

bannerImageSchema.index({ schoolId: 1, isActive: 1 });

module.exports = mongoose.model('BannerImage', bannerImageSchema);
