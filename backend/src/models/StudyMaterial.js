// models/StudyMaterial.js
const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true },
    description: String,
    type: {
        type: String,
        enum: ['syllabus', 'book', 'circular', 'assignment', 'other'],
        required: true
    },
    subject: String,
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

studyMaterialSchema.index({ schoolId: 1, type: 1 });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
