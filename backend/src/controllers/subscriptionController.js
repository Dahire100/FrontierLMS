const SubscriptionPlan = require('../models/SubscriptionPlan');

exports.getPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find({}).sort({ price: 1 });
        res.json({ success: true, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPlan = async (req, res) => {
    try {
        const plan = new SubscriptionPlan(req.body);
        await plan.save();
        res.status(201).json({ success: true, data: plan });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        res.json({ success: true, data: plan });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        res.json({ success: true, message: 'Plan deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInstallmentReport = async (req, res) => {
    try {
        // TODO: Implement actual database query for subscription installments
        // This is a mock response to demonstrate functionality
        const mockData = [
            { _id: '1', dueDate: new Date().toISOString(), amount: 5000, status: 'paid' },
            { _id: '2', dueDate: new Date(Date.now() + 86400000 * 30).toISOString(), amount: 5000, status: 'due' }
        ];
        res.json(mockData);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
