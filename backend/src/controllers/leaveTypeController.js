const LeaveType = require('../models/LeaveType');

exports.createLeaveType = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { name, allottedDays } = req.body;

        const leaveType = new LeaveType({
            schoolId,
            name,
            allottedDays
        });

        await leaveType.save();
        res.status(201).json({ message: 'Leave Type created successfully', leaveType });
    } catch (err) {
        console.error('Error creating leave type:', err);
        res.status(500).json({ error: 'Failed to create leave type' });
    }
};

exports.getAllLeaveTypes = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const leaveTypes = await LeaveType.find({ schoolId }).sort({ name: 1 });
        res.json(leaveTypes);
    } catch (err) {
        console.error('Error fetching leave types:', err);
        res.status(500).json({ error: 'Failed to fetch leave types' });
    }
};

exports.updateLeaveType = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;
        const updates = req.body;

        const leaveType = await LeaveType.findOneAndUpdate(
            { _id: id, schoolId },
            updates,
            { new: true }
        );

        if (!leaveType) return res.status(404).json({ error: 'Leave type not found' });
        res.json({ message: 'Leave type updated', leaveType });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update leave type' });
    }
};

exports.deleteLeaveType = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;

        const leaveType = await LeaveType.findOneAndDelete({ _id: id, schoolId });
        if (!leaveType) return res.status(404).json({ error: 'Leave type not found' });
        res.json({ message: 'Leave type deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete leave type' });
    }
};
