const Notification = require('../models/Notification');

// Get all notifications for the current user
exports.getMyNotifications = async (req, res) => {
    const { _id: userId } = req.user;

    try {
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications

        // Count unread
        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            isRead: false
        });

        res.json({
            notifications,
            unreadCount
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
    const { id } = req.params;
    const { _id: userId } = req.user;

    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: userId }, // Ensure ownership
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(notification);
    } catch (err) {
        console.error('Error marking notification as read:', err);
        res.status(500).json({ error: 'Failed to update notification' });
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
    const { _id: userId } = req.user;

    try {
        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        res.status(500).json({ error: 'Failed to update notifications' });
    }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
    const { id } = req.params;
    const { _id: userId } = req.user;

    try {
        const notification = await Notification.findOneAndDelete({ _id: id, recipient: userId });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (err) {
        console.error('Error deleting notification:', err);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
};

// Create a notification (Internal use or admin)
exports.createNotification = async (req, res) => {
    // This might be restricted to certain roles or internal calls
    const { recipient, title, message, type, link } = req.body;
    const { schoolId } = req.user;

    try {
        const notification = new Notification({
            recipient,
            schoolId,
            title,
            message,
            type,
            link
        });

        await notification.save();
        res.status(201).json(notification);
    } catch (err) {
        console.error('Error creating notification:', err);
        res.status(500).json({ error: 'Failed to create notification' });
    }
};
