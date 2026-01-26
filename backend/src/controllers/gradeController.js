const Grade = require('../models/Grade');

exports.getAllGrades = async (req, res) => {
    const { schoolId } = req.user;
    try {
        const grades = await Grade.find({ schoolId }).sort({ percentFrom: -1 });
        res.json(grades);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch grades' });
    }
};

exports.addGrade = async (req, res) => {
    const { schoolId } = req.user;
    const { gradeName, percentFrom, percentUpto, description } = req.body;
    try {
        const newGrade = new Grade({ schoolId, gradeName, percentFrom, percentUpto, description });
        await newGrade.save();
        res.status(201).json(newGrade);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add grade' });
    }
};

exports.updateGrade = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    try {
        const updated = await Grade.findOneAndUpdate({ _id: id, schoolId }, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Grade not found' });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update grade' });
    }
};

exports.deleteGrade = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    try {
        const deleted = await Grade.findOneAndDelete({ _id: id, schoolId });
        if (!deleted) return res.status(404).json({ error: 'Grade not found' });
        res.json({ message: 'Grade deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete grade' });
    }
};
