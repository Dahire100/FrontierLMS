// controllers/activityController.js
const Activity = require('../models/Activity');

// Create activity
exports.createActivity = async (req, res) => {
    const { schoolId, _id: userId } = req.user;
    const activityData = { ...req.body, schoolId, createdBy: userId };

    if (!activityData.className || !activityData.section || !activityData.subject || !activityData.activityName) {
        return res.status(400).json({
            error: 'Class, section, subject, and activity name are required'
        });
    }

    try {
        const activity = new Activity(activityData);
        await activity.save();

        const populatedActivity = await Activity.findById(activity._id)
            .populate('createdBy', 'firstName lastName');

        res.status(201).json({
            message: 'Activity created successfully',
            data: populatedActivity
        });
    } catch (err) {
        console.error('Error creating activity:', err);
        res.status(500).json({ error: 'Failed to create activity' });
    }
};

// Get all activities
exports.getAllActivities = async (req, res) => {
    const { schoolId } = req.user;
    const { className, section, subject, type, page = 1, limit = 10 } = req.query;

    try {
        const query = { schoolId, isActive: true };
        if (className) query.className = className;
        if (section) query.section = section;
        if (subject) query.subject = subject;
        if (type) query.type = type;

        const activities = await Activity.find(query)
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Activity.countDocuments(query);

        res.json({
            activities,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (err) {
        console.error('Error fetching activities:', err);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
};

// Get activity by ID
exports.getActivityById = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const activity = await Activity.findOne({ _id: id, schoolId })
            .populate('createdBy', 'firstName lastName email');

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        res.json(activity);
    } catch (err) {
        console.error('Error fetching activity:', err);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
};

// Update activity
exports.updateActivity = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    try {
        const activity = await Activity.findOne({ _id: id, schoolId });

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        Object.assign(activity, updates);
        await activity.save();

        const updatedActivity = await Activity.findById(id)
            .populate('createdBy', 'firstName lastName');

        res.json({
            message: 'Activity updated successfully',
            data: updatedActivity
        });
    } catch (err) {
        console.error('Error updating activity:', err);
        res.status(500).json({ error: 'Failed to update activity' });
    }
};

// Delete activity
exports.deleteActivity = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const activity = await Activity.findOne({ _id: id, schoolId });

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        // Soft delete
        activity.isActive = false;
        await activity.save();

        res.json({ message: 'Activity deleted successfully' });
    } catch (err) {
        console.error('Error deleting activity:', err);
        res.status(500).json({ error: 'Failed to delete activity' });
    }
};

// Bulk delete activities
exports.bulkDeleteActivities = async (req, res) => {
    const { schoolId } = req.user;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Activity IDs are required' });
    }

    try {
        const result = await Activity.updateMany(
            { _id: { $in: ids }, schoolId },
            { $set: { isActive: false } }
        );

        res.json({
            message: `${result.modifiedCount} activities deleted successfully`,
            count: result.modifiedCount
        });
    } catch (err) {
        console.error('Error bulk deleting activities:', err);
        res.status(500).json({ error: 'Failed to delete activities' });
    }
};

// Get activity statistics
exports.getActivityStats = async (req, res) => {
    const { schoolId } = req.user;

    try {
        const activities = await Activity.find({ schoolId, isActive: true });

        const stats = {
            total: activities.length,
            scholastic: activities.filter(a => a.type === 'Scholastic').length,
            nonScholastic: activities.filter(a => a.type === 'Non-Scholastic').length,
            bySubject: {},
            byClass: {}
        };

        activities.forEach(activity => {
            stats.bySubject[activity.subject] = (stats.bySubject[activity.subject] || 0) + 1;
            stats.byClass[activity.className] = (stats.byClass[activity.className] || 0) + 1;
        });

        res.json(stats);
    } catch (err) {
        console.error('Error fetching activity stats:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};
