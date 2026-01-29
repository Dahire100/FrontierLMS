// models/ExpenseHead.js
const mongoose = require('mongoose');

const expenseHeadSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

expenseHeadSchema.index({ schoolId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('ExpenseHead', expenseHeadSchema);
