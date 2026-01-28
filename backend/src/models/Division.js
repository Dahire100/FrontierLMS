const mongoose = require('mongoose');

const divisionSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true },
    percentFrom: { type: Number, required: true },
    percentUpto: { type: Number, required: true },
    description: String,
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Division', divisionSchema);
