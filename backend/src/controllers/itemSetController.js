// controllers/itemSetController.js
const ItemSet = require('../models/ItemSet');

exports.createSet = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const set = new ItemSet({ ...req.body, schoolId });
        await set.save();
        res.status(201).json({ message: 'Item set created successfully', data: set });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSets = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const sets = await ItemSet.find({ schoolId, isActive: true })
            .populate('items.item', 'itemName itemCode sellingPrice');
        res.json(sets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSet = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const set = await ItemSet.findOneAndUpdate(
            { _id: req.params.id, schoolId },
            req.body,
            { new: true }
        );
        res.json({ message: 'Item set updated', data: set });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSet = async (req, res) => {
    try {
        const { schoolId } = req.user;
        await ItemSet.findOneAndDelete({ _id: req.params.id, schoolId });
        res.json({ message: 'Item set deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
