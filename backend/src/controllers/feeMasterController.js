const FeeGroup = require('../models/FeeGroup');
const FeeType = require('../models/FeeType');
const FeeMaster = require('../models/FeeMaster');
const Class = require('../models/Class');

// --- Fee Group Controllers ---

exports.createFeeGroup = async (req, res) => {
    try {
        const { name, description } = req.body;
        const feeGroup = new FeeGroup({
            schoolId: req.user.schoolId,
            name,
            description
        });
        await feeGroup.save();
        res.status(201).json(feeGroup);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFeeGroups = async (req, res) => {
    try {
        const groups = await FeeGroup.find({ schoolId: req.user.schoolId });
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateFeeGroup = async (req, res) => {
    try {
        const group = await FeeGroup.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true }
        );
        if (!group) return res.status(404).json({ error: 'Fee Group not found' });
        res.json(group);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteFeeGroup = async (req, res) => {
    try {
        const group = await FeeGroup.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!group) return res.status(404).json({ error: 'Fee Group not found' });
        res.json({ message: 'Fee Group deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Fee Type Controllers ---

exports.createFeeType = async (req, res) => {
    try {
        const { feeGroupId, name, code, description } = req.body;
        const feeType = new FeeType({
            schoolId: req.user.schoolId,
            feeGroupId,
            name,
            code,
            description
        });
        await feeType.save();
        res.status(201).json(feeType);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFeeTypes = async (req, res) => {
    try {
        const types = await FeeType.find({ schoolId: req.user.schoolId }).populate('feeGroupId', 'name');
        res.json(types);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateFeeType = async (req, res) => {
    try {
        const type = await FeeType.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true }
        );
        if (!type) return res.status(404).json({ error: 'Fee Type not found' });
        res.json(type);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteFeeType = async (req, res) => {
    try {
        const type = await FeeType.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!type) return res.status(404).json({ error: 'Fee Type not found' });
        res.json({ message: 'Fee Type deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Fee Master Controllers ---

exports.createFeeMaster = async (req, res) => {
    try {
        const { feeGroupId, feeTypeId, classId, type, amount, dueDate, fineType, fineAmount, description } = req.body;

        // Check for duplicates
        const existing = await FeeMaster.findOne({
            schoolId: req.user.schoolId,
            feeGroupId,
            feeTypeId,
            classId
        });

        if (existing) {
            return res.status(400).json({ error: 'Fee Master already exists for this combination' });
        }

        const feeMaster = new FeeMaster({
            schoolId: req.user.schoolId,
            feeGroupId,
            feeTypeId,
            classId,
            type,
            amount,
            dueDate,
            fineType,
            fineAmount,
            description
        });
        await feeMaster.save();
        res.status(201).json(feeMaster);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFeeMasters = async (req, res) => {
    try {
        const { classId } = req.query;
        const query = { schoolId: req.user.schoolId };
        if (classId) query.classId = classId;

        const masters = await FeeMaster.find(query)
            .populate('feeGroupId', 'name')
            .populate('feeTypeId', 'name code')
            .populate('classId', 'class section');
        res.json(masters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateFeeMaster = async (req, res) => {
    try {
        const master = await FeeMaster.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true }
        );
        if (!master) return res.status(404).json({ error: 'Fee Master not found' });
        res.json(master);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteFeeMaster = async (req, res) => {
    try {
        const master = await FeeMaster.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!master) return res.status(404).json({ error: 'Fee Master not found' });
        res.json({ message: 'Fee Master deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
