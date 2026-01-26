const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String, // e.g., Parent, Student, Alumni
        required: false
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

testimonialSchema.index({ schoolId: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
