const FeeDiscount = require('../models/FeeDiscount');

exports.createFeeDiscount = async (req, res) => {
    try {
        const { name, discountCode, amount, description } = req.body;
        const discount = new FeeDiscount({
            schoolId: req.user.schoolId,
            name,
            discountCode,
            amount,
            description
        });
        await discount.save();
        res.status(201).json(discount);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFeeDiscounts = async (req, res) => {
    try {
        const discounts = await FeeDiscount.find({ schoolId: req.user.schoolId });
        res.json(discounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateFeeDiscount = async (req, res) => {
    try {
        const discount = await FeeDiscount.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true }
        );
        if (!discount) return res.status(404).json({ error: 'Fee Discount not found' });
        res.json(discount);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteFeeDiscount = async (req, res) => {
    try {
        const discount = await FeeDiscount.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!discount) return res.status(404).json({ error: 'Fee Discount not found' });
        res.json({ message: 'Fee Discount deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
