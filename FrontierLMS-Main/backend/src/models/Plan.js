const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    features: [{
        type: String
    }],
    maxStudents: {
        type: Number,
        required: true
    },
    maxTeachers: {
        type: Number,
        required: true
    },
    storage: {
        type: String,
        default: '10 GB'
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    subscribers: {
        type: Number,
        default: 0
    },
    revenue: {
        type: Number,
        default: 0
    },
    isPopular: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);
