const GatePass = require('../models/GatePass');

exports.getAllGatePasses = async (req, res) => {
    try {
        const passes = await GatePass.find({ schoolId: req.user.schoolId }).sort({ createdAt: -1 });
        res.json(passes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getGatePassById = async (req, res) => {
    try {
        const pass = await GatePass.findOne({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!pass) return res.status(404).json({ message: 'Gate pass not found' });
        res.json(pass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createGatePass = async (req, res) => {
    try {
        const passData = {
            ...req.body,
            schoolId: req.user.schoolId
        };
        const newPass = new GatePass(passData);
        await newPass.save();
        res.status(201).json(newPass);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateGatePass = async (req, res) => {
    try {
        const pass = await GatePass.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!pass) return res.status(404).json({ message: 'Gate pass not found' });
        res.json(pass);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteGatePass = async (req, res) => {
    try {
        const pass = await GatePass.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!pass) return res.status(404).json({ message: 'Gate pass not found' });
        res.json({ message: 'Gate pass deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
