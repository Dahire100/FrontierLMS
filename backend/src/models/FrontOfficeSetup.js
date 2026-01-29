const mongoose = require('mongoose');

const frontOfficeSetupSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    type: {
        type: String,
        enum: ['purpose', 'complain_type', 'source', 'reference', 'enquiry_status'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

frontOfficeSetupSchema.index({ schoolId: 1, type: 1 });

module.exports = mongoose.model('FrontOfficeSetup', frontOfficeSetupSchema);
