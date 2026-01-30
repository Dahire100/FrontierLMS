// controllers/soldItemPaymentController.js
const SoldItemPayment = require('../models/SoldItemPayment');

exports.createPayment = async (req, res) => {
    try {
        const { schoolId, _id: userId } = req.user;
        const payment = new SoldItemPayment({ ...req.body, schoolId, receivedBy: userId });
        await payment.save();
        res.status(201).json({ message: 'Payment recorded successfully', data: payment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const payments = await SoldItemPayment.find({ schoolId })
            .populate('sale')
            .populate('receivedBy', 'firstName lastName')
            .sort({ paymentDate: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPaymentById = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const payment = await SoldItemPayment.findOne({ _id: req.params.id, schoolId })
            .populate('sale');
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        res.json(payment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePayment = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const payment = await SoldItemPayment.findOneAndUpdate(
            { _id: req.params.id, schoolId },
            req.body,
            { new: true }
        );
        res.json({ message: 'Payment updated', data: payment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const { schoolId } = req.user;
        await SoldItemPayment.findOneAndDelete({ _id: req.params.id, schoolId });
        res.json({ message: 'Payment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
