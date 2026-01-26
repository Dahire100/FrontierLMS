const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    planName: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    durationValues: {
        type: Number,
        required: true,
        default: 30 // Days
    },
    features: {
        type: [String], // Array of feature strings
        default: []
    },
    maxStudents: {
        type: Number, // Limit on number of students, if applicable
        default: 0 // 0 for unlimited
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Archived'],
        default: 'Active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
