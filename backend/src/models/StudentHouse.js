const mongoose = require('mongoose');

const studentHouseSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    master: { // Could be a Teacher ID or just a name string for now
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

studentHouseSchema.index({ schoolId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('StudentHouse', studentHouseSchema);
