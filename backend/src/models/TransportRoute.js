const mongoose = require('mongoose');

const transportRouteSchema = new mongoose.Schema({
    routeName: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    driverName: { type: String, required: true },
    driverPhone: { type: String, required: true },
    routeCharge: { type: Number, required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TransportRoute', transportRouteSchema);
