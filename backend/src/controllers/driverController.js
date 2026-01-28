const Driver = require('../models/Driver');

exports.getDrivers = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const drivers = await Driver.find({ schoolId, isActive: true }).sort({ createdAt: -1 });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch drivers' });
    }
};

exports.addDriver = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { name, phone, license, route } = req.body;

        const newDriver = new Driver({
            schoolId,
            name,
            phone,
            licenseNumber: license,
            route
        });

        await newDriver.save();
        res.status(201).json(newDriver);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add driver' });
    }
};

exports.deleteDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const { schoolId } = req.user;
        await Driver.findOneAndDelete({ _id: id, schoolId });
        res.json({ message: 'Driver deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete driver' });
    }
};
