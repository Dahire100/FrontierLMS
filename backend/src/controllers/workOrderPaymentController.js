// controllers/workOrderPaymentController.js
const WorkOrderPayment = require('../models/WorkOrderPayment');

const WorkOrder = require('../models/WorkOrder');

const fs = require('fs');
const path = require('path');

const logToFile = (msg) => {
    const logPath = path.join(__dirname, '../../debug_payment.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
};

exports.createPayment = async (req, res) => {
    try {
        logToFile(`Received Payment Request: ${JSON.stringify(req.body)}`);

        const { schoolId, _id: userId } = req.user;
        let { workOrder: workOrderId, amount, paymentNumber, vendor, paymentType, netAmount } = req.body;

        console.log('Creating Payment:', req.body);

        // Validation
        if (!workOrderId || !amount || !vendor) {
            return res.status(400).json({ error: 'Work Order, Vendor, and Amount are required' });
        }

        // Verify WorkOrder exists
        const workOrder = await WorkOrder.findOne({ _id: workOrderId, schoolId });
        if (!workOrder) {
            return res.status(404).json({ error: 'Work Order not found' });
        }

        // Defaults and Auto-generation
        if (!paymentNumber) {
            paymentNumber = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }
        if (!paymentType) paymentType = 'partial';
        if (!netAmount) netAmount = amount;

        const payment = new WorkOrderPayment({
            ...req.body,
            paymentNumber,
            paymentType,
            netAmount,
            schoolId,
            processedBy: userId
        });

        await payment.save();

        // Update WorkOrder financials
        const allPayments = await WorkOrderPayment.find({ workOrder: workOrderId, schoolId });
        const totalPaid = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        const advancePaid = totalPaid;
        const balanceAmount = Math.max(0, workOrder.grandTotal - totalPaid);
        const paymentStatus = balanceAmount <= 0 ? 'paid' : (totalPaid > 0 ? 'partial' : 'pending');

        await WorkOrder.updateOne(
            { _id: workOrderId },
            {
                $set: {
                    advancePaid,
                    balanceAmount,
                    paymentStatus
                }
            }
        );

        res.status(201).json({ message: 'Work Order Payment created successfully', data: payment });
    } catch (err) {
        logToFile(`Error creating payment: ${err.message}`);
        console.error('Payment Creation Error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const payments = await WorkOrderPayment.find({ schoolId })
            .populate('workOrder')
            .populate('vendor', 'vendorName')
            .populate('processedBy', 'firstName lastName')
            .sort({ paymentDate: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPaymentById = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const payment = await WorkOrderPayment.findOne({ _id: req.params.id, schoolId })
            .populate('workOrder')
            .populate('vendor');
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        res.json(payment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePayment = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const payment = await WorkOrderPayment.findOneAndUpdate(
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
        await WorkOrderPayment.findOneAndDelete({ _id: req.params.id, schoolId });
        res.json({ message: 'Payment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
