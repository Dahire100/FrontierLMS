const mongoose = require('mongoose');

const hrTaskSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    status: { type: String, enum: ['pending', 'completed', 'in_progress'], default: 'pending' },
    startDate: { type: Date },
    dueDate: { type: Date },
    authorizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    remarks: { type: String },
    summary: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
}, { timestamps: true });

module.exports = mongoose.model('HRTask', hrTaskSchema);
