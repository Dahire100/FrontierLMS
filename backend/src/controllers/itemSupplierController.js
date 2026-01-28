// controllers/itemSupplierController.js
const ItemSupplier = require('../models/ItemSupplier');

exports.createSupplier = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const supplier = new ItemSupplier({ ...req.body, schoolId });
        await supplier.save();
        res.status(201).json({ message: 'Supplier created successfully', data: supplier });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSuppliers = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const suppliers = await ItemSupplier.find({ schoolId, isActive: true });
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const supplier = await ItemSupplier.findOneAndUpdate(
            { _id: req.params.id, schoolId },
            req.body,
            { new: true }
        );
        res.json({ message: 'Supplier updated', data: supplier });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        const { schoolId } = req.user;
        await ItemSupplier.findOneAndDelete({ _id: req.params.id, schoolId });
        res.json({ message: 'Supplier deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
