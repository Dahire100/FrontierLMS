const mongoose = require('mongoose');

const termSchema = new mongoose.Schema({
    termName: { type: String, required: true },
    termCode: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    academicSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSession' }, // Optional, linking to session
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure unique term name per school
termSchema.index({ termName: 1, schoolId: 1 }, { unique: true });

module.exports = mongoose.model('Term', termSchema);
