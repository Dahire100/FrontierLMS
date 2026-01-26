// models/StudentDocument.js
const mongoose = require('mongoose');

const studentDocumentSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    description: String,
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

studentDocumentSchema.index({ schoolId: 1, studentId: 1 });

module.exports = mongoose.model('StudentDocument', studentDocumentSchema);
