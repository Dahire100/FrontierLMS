const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
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
    description: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

departmentSchema.index({ schoolId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);
