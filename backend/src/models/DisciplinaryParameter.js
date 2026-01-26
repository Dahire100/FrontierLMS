const mongoose = require('mongoose');

const disciplinaryParameterSchema = new mongoose.Schema({
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
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

disciplinaryParameterSchema.index({ schoolId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('DisciplinaryParameter', disciplinaryParameterSchema);
