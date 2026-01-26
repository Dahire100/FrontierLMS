const PhoneCallLog = require('../models/PhoneCallLog');

exports.getAllLogs = async (req, res) => {
    try {
        const { callType, startDate, endDate } = req.query;
        const query = { schoolId: req.user.schoolId };

        if (callType && callType !== 'all') query.callType = callType;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const logs = await PhoneCallLog.find(query)
            .sort({ date: -1 });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLogById = async (req, res) => {
    try {
        const log = await PhoneCallLog.findOne({
            _id: req.params.id,
            schoolId: req.user.schoolId
        });

        if (!log) return res.status(404).json({ message: 'Call log not found' });
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createLog = async (req, res) => {
    try {
        const logData = {
            ...req.body,
            schoolId: req.user.schoolId
        };

        const newLog = new PhoneCallLog(logData);
        await newLog.save();
        res.status(201).json(newLog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateLog = async (req, res) => {
    try {
        const log = await PhoneCallLog.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!log) return res.status(404).json({ message: 'Call log not found' });
        res.json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteLog = async (req, res) => {
    try {
        const log = await PhoneCallLog.findOneAndDelete({
            _id: req.params.id,
            schoolId: req.user.schoolId
        });

        if (!log) return res.status(404).json({ message: 'Call log not found' });
        res.json({ message: 'Call log deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
