const SchoolTime = require('../models/SchoolTime');

exports.getSchoolTimes = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const times = await SchoolTime.find({ schoolId })
            .populate('classId', 'className')
            .sort({ srNo: 1 });
        res.json({ success: true, data: times });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addSchoolTime = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const newTime = new SchoolTime({
            ...req.body,
            schoolId
        });
        await newTime.save();

        // Return populated
        const populated = await SchoolTime.findById(newTime._id).populate('classId', 'className');
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateSchoolTime = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await SchoolTime.findByIdAndUpdate(id, req.body, { new: true })
            .populate('classId', 'className');
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteSchoolTime = async (req, res) => {
    try {
        const { id } = req.params;
        await SchoolTime.findByIdAndDelete(id);
        res.json({ success: true, message: "School time deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
