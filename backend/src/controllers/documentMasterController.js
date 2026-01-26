const DocumentMaster = require('../models/DocumentMaster');

exports.getDocumentMasters = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const docs = await DocumentMaster.find({ schoolId });
        res.json({ success: true, data: docs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addDocumentMaster = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const newDoc = new DocumentMaster({
            ...req.body,
            schoolId
        });
        await newDoc.save();
        res.status(201).json({ success: true, data: newDoc });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateDocumentMaster = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedDoc = await DocumentMaster.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ success: true, data: updatedDoc });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteDocumentMaster = async (req, res) => {
    try {
        const { id } = req.params;
        await DocumentMaster.findByIdAndDelete(id);
        res.json({ success: true, message: 'Document master deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
