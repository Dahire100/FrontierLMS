const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    belongsTo: {
        type: String,
        enum: ['student', 'staff', 'form', 'recruitment', 'admission_enquiry', 'payroll'],
        required: true
    },
    fieldType: {
        type: String,
        enum: ['text', 'number', 'date', 'textarea', 'dropdown'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    columnGrid: {
        type: Number,
        default: 12
    },
    fieldValues: {
        type: String // Comma separated values for dropdowns
    },
    validation: {
        required: { type: Boolean, default: false }
    },
    visibility: {
        onTable: { type: Boolean, default: false },
        parentStudent: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CustomField', customFieldSchema);
