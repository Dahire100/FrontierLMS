const Video = require('../models/Video');

// Create new video
exports.createVideo = async (req, res) => {
    try {
        const videoData = {
            ...req.body,
            schoolId: req.user.schoolId,
            uploadedBy: req.user.userId
        };

        const video = new Video(videoData);
        await video.save();

        res.status(201).json({
            success: true,
            message: 'Video created successfully',
            data: video
        });
    } catch (error) {
        console.error('Error creating video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create video',
            error: error.message
        });
    }
};

// Get all videos
exports.getAllVideos = async (req, res) => {
    try {
        const { classId, section, subject, category, tags, isPublished } = req.query;
        const filter = { schoolId: req.user.schoolId };

        if (classId) filter.classId = classId;
        if (section) filter.section = section;
        if (subject) filter.subject = subject;
        if (category) filter.category = category;
        if (tags) filter.tags = { $in: tags.split(',') };
        if (isPublished !== undefined) filter.isPublished = isPublished === 'true';

        const videos = await Video.find(filter)
            .populate('classId', 'name')
            .populate('category', 'name')
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: videos,
            count: videos.length
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch videos',
            error: error.message
        });
    }
};

// Get video by ID
exports.getVideoById = async (req, res) => {
    try {
        const video = await Video.findOne({
            _id: req.params.id,
            schoolId: req.user.schoolId
        })
            .populate('classId', 'name')
            .populate('category', 'name')
            .populate('uploadedBy', 'name email');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        res.status(200).json({
            success: true,
            data: video
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch video',
            error: error.message
        });
    }
};

// Update video
exports.updateVideo = async (req, res) => {
    try {
        const video = await Video.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Video updated successfully',
            data: video
        });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update video',
            error: error.message
        });
    }
};

// Delete video
exports.deleteVideo = async (req, res) => {
    try {
        const video = await Video.findOneAndDelete({
            _id: req.params.id,
            schoolId: req.user.schoolId
        });

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete video',
            error: error.message
        });
    }
};

// Increment view count
exports.incrementView = async (req, res) => {
    try {
        const video = await Video.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            { $inc: { viewCount: 1 } },
            { new: true }
        );

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        res.status(200).json({
            success: true,
            data: video
        });
    } catch (error) {
        console.error('Error updating view count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update view count',
            error: error.message
        });
    }
};

// Bulk delete videos
exports.bulkDeleteVideos = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid video IDs'
            });
        }

        await Video.deleteMany({
            _id: { $in: ids },
            schoolId: req.user.schoolId
        });

        res.status(200).json({
            success: true,
            message: 'Videos deleted successfully'
        });
    } catch (error) {
        console.error('Error bulk deleting videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete videos',
            error: error.message
        });
    }
};

// Get video statistics
exports.getVideoStats = async (req, res) => {
    try {
        const stats = await Video.aggregate([
            { $match: { schoolId: req.user.schoolId } },
            {
                $group: {
                    _id: null,
                    totalVideos: { $sum: 1 },
                    totalViews: { $sum: '$viewCount' },
                    publishedVideos: {
                        $sum: { $cond: ['$isPublished', 1, 0] }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats[0] || {
                totalVideos: 0,
                totalViews: 0,
                publishedVideos: 0
            }
        });
    } catch (error) {
        console.error('Error fetching video stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch video statistics',
            error: error.message
        });
    }
};
