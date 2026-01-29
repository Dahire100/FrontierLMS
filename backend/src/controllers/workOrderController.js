// controllers/workOrderController.js
const WorkOrder = require('../models/WorkOrder');

exports.createWorkOrder = async (req, res) => {
    try {
        const { schoolId, _id: userId } = req.user;
        const workOrder = new WorkOrder({
            ...req.body,
            schoolId,
            createdBy: userId
        });
        await workOrder.save();
        res.status(201).json({ message: 'Work order created successfully', data: workOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getWorkOrders = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const query = { schoolId };

        const workOrders = await WorkOrder.find(query)
            .populate('vendor', 'supplierName')
            .sort({ createdAt: -1 });

        res.json(workOrders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateWorkOrder = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const workOrder = await WorkOrder.findOneAndUpdate(
            { _id: req.params.id, schoolId },
            req.body,
            { new: true }
        );
        res.json({ message: 'Work order updated', data: workOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteWorkOrder = async (req, res) => {
    try {
        const { schoolId } = req.user;
        await WorkOrder.findOneAndDelete({ _id: req.params.id, schoolId });
        res.json({ message: 'Work order deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
