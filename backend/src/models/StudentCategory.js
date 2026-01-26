const mongoose = require('mongoose');

const studentCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Ensure unique category name per school
studentCategorySchema.index({ name: 1, schoolId: 1 }, { unique: true });

module.exports = mongoose.model('StudentCategory', studentCategorySchema);
