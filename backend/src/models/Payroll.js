const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    month: { type: String, required: true },
    year: { type: String, required: true },
    basicSalary: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    status: { type: String, enum: ['generated', 'paid'], default: 'generated' },
    paymentDate: { type: Date },
    paymentMode: { type: String },
    remarks: { type: String }
}, { timestamps: true });

payrollSchema.index({ staffId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
