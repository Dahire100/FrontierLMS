const StudyMaterial = require('../models/StudyMaterial');

exports.uploadMaterial = async (req, res) => {
    try {
        const { title, description, type, subject, classes, fileUrl } = req.body;
        const schoolId = req.user.schoolId;
        const uploadedBy = req.user.id; // User ID from token

        const newMaterial = new StudyMaterial({
            schoolId,
            title,
            description,
            type,
            subject,
            classes, // Expecting array of Class IDs or strings if simplified
            fileUrl,
            uploadedBy
        });

        await newMaterial.save();
        res.status(201).json({ message: 'Material uploaded successfully', material: newMaterial });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload material', details: error.message });
    }
};

exports.getMaterials = async (req, res) => {
    try {
        const { type, rClass, subject } = req.query;
        const schoolId = req.user.schoolId;

        const query = { schoolId, isActive: true };
        if (type) query.type = type;
        if (subject) query.subject = subject;
        // if (rClass) query.classes = rClass; // Complex if classes is array of text vs IDs

        const materials = await StudyMaterial.find(query).sort({ createdAt: -1 });
        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch materials', details: error.message });
    }
};

exports.deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;

        const material = await StudyMaterial.findOneAndDelete({ _id: id, schoolId });

        if (!material) {
            return res.status(404).json({ error: 'Material not found' });
        }

        res.status(200).json({ message: 'Material deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete material' });
    }
};
