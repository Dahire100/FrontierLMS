const mongoose = require('mongoose');

const inventoryRequisitionSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    items: [{
        category: String,
        itemName: String,
        quantity: { type: Number, required: true },
        description: String
    }],
    targetClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    targetClassString: String, // fallback e.g., "10-A"
    requiredDate: Date,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'fulfilled'],
        default: 'pending'
    },
    logisticsRemark: String
}, {
    timestamps: true
});

module.exports = mongoose.model('InventoryRequisition', inventoryRequisitionSchema);
