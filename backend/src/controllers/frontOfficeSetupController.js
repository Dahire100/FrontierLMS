const FrontOfficeSetup = require('../models/FrontOfficeSetup');

exports.getAllSetupItems = async (req, res) => {
    try {
        const { type } = req.query;
        const query = { schoolId: req.user.schoolId };

        if (type) query.type = type;

        const items = await FrontOfficeSetup.find(query).sort({ name: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getItemById = async (req, res) => {
    try {
        const item = await FrontOfficeSetup.findOne({
            _id: req.params.id,
            schoolId: req.user.schoolId
        });

        if (!item) return res.status(404).json({ message: 'Setup item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createItem = async (req, res) => {
    try {
        const itemData = {
            ...req.body,
            schoolId: req.user.schoolId
        };

        const newItem = new FrontOfficeSetup(itemData);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const item = await FrontOfficeSetup.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!item) return res.status(404).json({ message: 'Setup item not found' });
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const item = await FrontOfficeSetup.findOneAndDelete({
            _id: req.params.id,
            schoolId: req.user.schoolId
        });

        if (!item) return res.status(404).json({ message: 'Setup item not found' });
        res.json({ message: 'Setup item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
