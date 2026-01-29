const mongoose = require('mongoose');

const staffAdvanceSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    settlementMonth: { type: String }, // e.g. "2025-11"
    note: { type: String },
    status: { type: String, enum: ['active', 'settled', 'cancelled'], default: 'active' },
    installments: [{
        amount: Number,
        dueDate: Date,
        status: { type: String, enum: ['pending', 'paid'], default: 'pending' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('StaffAdvance', staffAdvanceSchema);
