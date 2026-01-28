const mongoose = require('mongoose');

const academicSessionSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    name: {
        type: String,
        required: true // Format YYYY-YY or YYYY-YYYY
    },
    display: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AcademicSession', academicSessionSchema);
