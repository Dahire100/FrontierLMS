const mongoose = require('mongoose');

const staffTimeSlotSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    startTime: {
        type: String, // HH:MM
        required: true
    },
    endTime: {
        type: String, // HH:MM
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StaffTimeSlot', staffTimeSlotSchema);
