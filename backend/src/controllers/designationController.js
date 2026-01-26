const Designation = require('../models/Designation');

exports.createDesignation = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { name, description } = req.body;

        const designation = new Designation({
            schoolId,
            name,
            description
        });

        await designation.save();
        res.status(201).json({ message: 'Designation created successfully', designation });
    } catch (err) {
        console.error('Error creating designation:', err);
        res.status(500).json({ error: 'Failed to create designation' });
    }
};

exports.getAllDesignations = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const designations = await Designation.find({ schoolId }).sort({ name: 1 });
        res.json(designations);
    } catch (err) {
        console.error('Error fetching designations:', err);
        res.status(500).json({ error: 'Failed to fetch designations' });
    }
};

exports.updateDesignation = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;
        const updates = req.body;

        const designation = await Designation.findOneAndUpdate(
            { _id: id, schoolId },
            updates,
            { new: true }
        );

        if (!designation) return res.status(404).json({ error: 'Designation not found' });
        res.json({ message: 'Designation updated', designation });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update designation' });
    }
};

exports.deleteDesignation = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;

        const designation = await Designation.findOneAndDelete({ _id: id, schoolId });
        if (!designation) return res.status(404).json({ error: 'Designation not found' });
        res.json({ message: 'Designation deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete designation' });
    }
};
