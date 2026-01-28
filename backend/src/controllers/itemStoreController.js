// controllers/itemStoreController.js
const ItemStore = require('../models/ItemStore');

exports.createStore = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const store = new ItemStore({ ...req.body, schoolId });
        await store.save();
        res.status(201).json({ message: 'Store created successfully', data: store });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStores = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const stores = await ItemStore.find({ schoolId, isActive: true });
        res.json(stores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStore = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const store = await ItemStore.findOneAndUpdate(
            { _id: req.params.id, schoolId },
            req.body,
            { new: true }
        );
        res.json({ message: 'Store updated', data: store });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteStore = async (req, res) => {
    try {
        const { schoolId } = req.user;
        await ItemStore.findOneAndDelete({ _id: req.params.id, schoolId });
        res.json({ message: 'Store deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
