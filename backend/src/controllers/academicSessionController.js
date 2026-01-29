const AcademicSession = require('../models/AcademicSession');

exports.getSessions = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const sessions = await AcademicSession.find({ schoolId }).sort({ name: -1 });
        res.json({ success: true, data: sessions });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addSession = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { name, display, isActive } = req.body;

        // Check if session with same name exists
        const existing = await AcademicSession.findOne({ schoolId, name });
        if (existing) {
            return res.status(400).json({ success: false, error: "Session name already exists" });
        }

        // If this session is set to active, deactivate others
        if (isActive) {
            await AcademicSession.updateMany({ schoolId }, { isActive: false });
        }

        const session = new AcademicSession({
            schoolId,
            name,
            display,
            isActive: !!isActive
        });

        await session.save();
        res.status(201).json({ success: true, data: session });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (isActive) {
            const session = await AcademicSession.findById(id);
            if (session) {
                await AcademicSession.updateMany({ schoolId: session.schoolId }, { isActive: false });
            }
        }

        const updated = await AcademicSession.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        await AcademicSession.findByIdAndDelete(id);
        res.json({ success: true, message: "Session deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
