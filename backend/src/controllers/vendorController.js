// controllers/vendorController.js
const Vendor = require('../models/Vendor');

exports.createVendor = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const vendor = new Vendor({ ...req.body, schoolId });
        await vendor.save();
        res.status(201).json({ message: 'Vendor created successfully', data: vendor });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getVendors = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const vendors = await Vendor.find({ schoolId, isActive: true });
        res.json(vendors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getVendorById = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const vendor = await Vendor.findOne({ _id: req.params.id, schoolId });
        if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
        res.json(vendor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateVendor = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const vendor = await Vendor.findOneAndUpdate(
            { _id: req.params.id, schoolId },
            req.body,
            { new: true }
        );
        res.json({ message: 'Vendor updated', data: vendor });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteVendor = async (req, res) => {
    try {
        const { schoolId } = req.user;
        await Vendor.findOneAndDelete({ _id: req.params.id, schoolId });
        res.json({ message: 'Vendor deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
