const upload = require('../middleware/documentUpload');

exports.uploadFile = (req, res) => {
    // handled by middleware
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const { fieldname, originalname, encoding, mimetype, destination, filename, path: filePath, size } = req.file;

    // Construct public URL (adjust based on your serving setup)
    // Assuming backend serves /uploads via express.static
    const url = `/uploads/documents/${filename}`;

    res.json({
        success: true,
        file: {
            filename: originalname,
            url: url,
            mimetype,
            size,
            uploadedAt: new Date()
        }
    });
};
