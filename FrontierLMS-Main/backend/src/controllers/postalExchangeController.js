const PostalExchange = require('../models/PostalExchange');

exports.getAllPostal = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;
        const query = { schoolId: req.user.schoolId };

        if (type && type !== 'all') query.type = type;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const records = await PostalExchange.find(query)
            .sort({ date: -1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPostalById = async (req, res) => {
    try {
        const record = await PostalExchange.findOne({
            _id: req.params.id,
            schoolId: req.user.schoolId
        });

        if (!record) return res.status(404).json({ message: 'Postal record not found' });
        res.json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createPostal = async (req, res) => {
    try {
        const postalData = {
            ...req.body,
            schoolId: req.user.schoolId
        };

        const newRecord = new PostalExchange(postalData);
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updatePostal = async (req, res) => {
    try {
        const record = await PostalExchange.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!record) return res.status(404).json({ message: 'Postal record not found' });
        res.json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deletePostal = async (req, res) => {
    try {
        const record = await PostalExchange.findOneAndDelete({
            _id: req.params.id,
            schoolId: req.user.schoolId
        });

        if (!record) return res.status(404).json({ message: 'Postal record not found' });
        res.json({ message: 'Postal record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
