const mongoose = require('mongoose');

const onlineAdmissionSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    fatherName: {
        type: String,
    },
    class: {
        type: String,
        required: true
    },
    dob: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    category: {
        type: String
    },
    mobile: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    transactionId: {
        type: String
    },
    paymentStatus: {
        type: String,
        default: 'Unpaid' // Paid, Unpaid
    },
    transactionDate: {
        type: Date
    },
    isEnrolled: {
        type: Boolean,
        default: false
    },
    appliedDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

onlineAdmissionSchema.index({ schoolId: 1, appliedDate: -1 });

module.exports = mongoose.model('OnlineAdmission', onlineAdmissionSchema);
