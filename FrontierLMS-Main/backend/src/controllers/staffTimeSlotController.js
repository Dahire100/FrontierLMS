const StaffTimeSlot = require('../models/StaffTimeSlot');

exports.getStaffTimeSlots = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const slots = await StaffTimeSlot.find({ schoolId }).sort({ startTime: 1 });
        res.json({ success: true, data: slots });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addStaffTimeSlot = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { startTime, endTime } = req.body;

        // Simple overlap check
        const existing = await StaffTimeSlot.find({ schoolId });
        const isOverlap = existing.some(slot => {
            return (startTime < slot.endTime && endTime > slot.startTime);
        });

        if (isOverlap) {
            return res.status(400).json({ success: false, error: "Time slot overlaps with an existing one" });
        }

        const newSlot = new StaffTimeSlot({ ...req.body, schoolId });
        await newSlot.save();
        res.status(201).json({ success: true, data: newSlot });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateStaffTimeSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await StaffTimeSlot.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteStaffTimeSlot = async (req, res) => {
    try {
        const { id } = req.params;
        await StaffTimeSlot.findByIdAndDelete(id);
        res.json({ success: true, message: "Time slot deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
