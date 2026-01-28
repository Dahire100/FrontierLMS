const DownloadContent = require('../models/DownloadContent');

// Create new download content
exports.createDownloadContent = async (req, res) => {
    try {
        const contentData = {
            ...req.body,
            schoolId: req.user.schoolId,
            uploadedBy: req.user.userId
        };

        const content = new DownloadContent(contentData);
        await content.save();

        res.status(201).json({
            success: true,
            message: 'Content uploaded successfully',
            data: content
        });
    } catch (error) {
        console.error('Error creating download content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload content',
            error: error.message
        });
    }
};

// Get all download contents
exports.getAllDownloadContents = async (req, res) => {
    try {
        const { 
            contentType, 
            classId, 
            section, 
            subject, 
            category, 
            isPublished 
        } = req.query;
        const filter = { schoolId: req.user.schoolId };

        if (contentType) filter.contentType = contentType;
        if (classId) filter.classId = classId;
        if (section) filter.section = section;
        if (subject) filter.subject = subject;
        if (category) filter.category = category;
        if (isPublished !== undefined) filter.isPublished = isPublished === 'true';

        const contents = await DownloadContent.find(filter)
            .populate('classId', 'name')
            .populate('category', 'name')
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: contents,
            count: contents.length
        });
    } catch (error) {
        console.error('Error fetching download contents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contents',
            error: error.message
        });
    }
};

// Get download content by ID
exports.getDownloadContentById = async (req, res) => {
    try {
        const content = await DownloadContent.findOne({
            _id: req.params.id,
            schoolId: req.user.schoolId
        })
            .populate('classId', 'name')
            .populate('category', 'name')
            .populate('uploadedBy', 'name email');

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        res.status(200).json({
            success: true,
            data: content
        });
    } catch (error) {
        console.error('Error fetching download content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch content',
            error: error.message
        });
    }
};

// Update download content
exports.updateDownloadContent = async (req, res) => {
    try {
        const content = await DownloadContent.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Content updated successfully',
            data: content
        });
    } catch (error) {
        console.error('Error updating download content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update content',
            error: error.message
        });
    }
};

// Delete download content
exports.deleteDownloadContent = async (req, res) => {
    try {
        const content = await DownloadContent.findOneAndDelete({
            _id: req.params.id,
            schoolId: req.user.schoolId
        });

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Content deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting download content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete content',
            error: error.message
        });
    }
};

// Increment download count
exports.incrementDownload = async (req, res) => {
    try {
        const content = await DownloadContent.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            { $inc: { downloadCount: 1 } },
            { new: true }
        );

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        res.status(200).json({
            success: true,
            data: content
        });
    } catch (error) {
        console.error('Error updating download count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update download count',
            error: error.message
        });
    }
};

// Bulk delete download contents
exports.bulkDeleteDownloadContents = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid content IDs'
            });
        }

        await DownloadContent.deleteMany({
            _id: { $in: ids },
            schoolId: req.user.schoolId
        });

        res.status(200).json({
            success: true,
            message: 'Contents deleted successfully'
        });
    } catch (error) {
        console.error('Error bulk deleting download contents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete contents',
            error: error.message
        });
    }
};

// Get download statistics
exports.getDownloadStats = async (req, res) => {
    try {
        const stats = await DownloadContent.aggregate([
            { $match: { schoolId: req.user.schoolId } },
            {
                $group: {
                    _id: '$contentType',
                    count: { $sum: 1 },
                    totalDownloads: { $sum: '$downloadCount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching download stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};
