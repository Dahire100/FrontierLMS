const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    gradeName: { type: String, required: true },
    percentFrom: { type: Number, required: true },
    percentUpto: { type: Number, required: true },
    description: String,
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Grade', gradeSchema);
