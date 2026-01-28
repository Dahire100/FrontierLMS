const Vehicle = require('../models/Vehicle');

exports.getVehicles = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const vehicles = await Vehicle.find({ schoolId, isActive: true }).sort({ createdAt: -1 });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
};

exports.addVehicle = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { number, capacity, route } = req.body; // Frontend sends 'number'

        const newVehicle = new Vehicle({
            schoolId,
            vehicleNumber: number,
            capacity,
            route
        });

        await newVehicle.save();
        res.status(201).json(newVehicle);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add vehicle' });
    }
};

exports.deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const { schoolId } = req.user;
        await Vehicle.findOneAndDelete({ _id: id, schoolId });
        res.json({ message: 'Vehicle deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete vehicle' });
    }
};
