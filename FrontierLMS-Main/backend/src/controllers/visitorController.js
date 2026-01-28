const Visitor = require('../models/Visitor');

exports.getAllVisitors = async (req, res) => {
    try {
        const { purpose, startDate, endDate } = req.query;
        const query = { schoolId: req.user.schoolId };

        if (purpose && purpose !== 'all') query.purpose = purpose;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const visitors = await Visitor.find(query)
            .sort({ date: -1, inTime: -1 });

        res.json(visitors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getVisitorById = async (req, res) => {
    try {
        const visitor = await Visitor.findOne({
            _id: req.params.id,
            schoolId: req.user.schoolId
        });

        if (!visitor) return res.status(404).json({ message: 'Visitor record not found' });
        res.json(visitor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createVisitor = async (req, res) => {
    try {
        const visitorData = {
            ...req.body,
            schoolId: req.user.schoolId
        };

        const newVisitor = new Visitor(visitorData);
        await newVisitor.save();
        res.status(201).json(newVisitor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateVisitor = async (req, res) => {
    try {
        const visitor = await Visitor.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!visitor) return res.status(404).json({ message: 'Visitor record not found' });
        res.json(visitor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteVisitor = async (req, res) => {
    try {
        const visitor = await Visitor.findOneAndDelete({
            _id: req.params.id,
            schoolId: req.user.schoolId
        });

        if (!visitor) return res.status(404).json({ message: 'Visitor record not found' });
        res.json({ message: 'Visitor record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
