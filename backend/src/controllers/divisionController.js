const Division = require('../models/Division');

exports.getAllDivisions = async (req, res) => {
    const { schoolId } = req.user;
    try {
        const divisions = await Division.find({ schoolId }).sort({ percentFrom: -1 });
        res.json(divisions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch divisions' });
    }
};

exports.addDivision = async (req, res) => {
    const { schoolId } = req.user;
    const { name, percentFrom, percentUpto, description } = req.body;
    try {
        const newDivision = new Division({ schoolId, name, percentFrom, percentUpto, description });
        await newDivision.save();
        res.status(201).json(newDivision);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add division' });
    }
};

exports.updateDivision = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    try {
        const updated = await Division.findOneAndUpdate({ _id: id, schoolId }, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Division not found' });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update division' });
    }
};

exports.deleteDivision = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    try {
        const deleted = await Division.findOneAndDelete({ _id: id, schoolId });
        if (!deleted) return res.status(404).json({ error: 'Division not found' });
        res.json({ message: 'Division deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete division' });
    }
};
