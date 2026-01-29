const Template = require('../models/Template');

exports.getTemplates = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const templates = await Template.find({ schoolId });
        res.json({ success: true, data: templates });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addTemplate = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const template = new Template({ ...req.body, schoolId });
        await template.save();
        res.status(201).json({ success: true, data: template });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Template.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        await Template.findByIdAndDelete(id);
        res.json({ success: true, message: "Template deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
