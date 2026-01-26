const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    position: {
        type: String,
        enum: ['Header', 'Footer', 'Sidebar'],
        default: 'Header'
    },
    items: [{
        label: String,
        link: String,
        order: Number
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

menuSchema.index({ schoolId: 1 });

module.exports = mongoose.model('Menu', menuSchema);
