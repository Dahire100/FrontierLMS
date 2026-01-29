// controllers/noticeController.js
const Notice = require('../models/Notice');

// Get all notices
exports.getAllNotices = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { type, targetAudience } = req.query;

    const query = { schoolId, isActive: true };
    if (type) query.type = type;
    if (targetAudience) query.targetAudience = targetAudience;

    const notices = await Notice.find(query)
      .populate('postedBy', 'firstName lastName')
      .sort({ isPinned: -1, publishedDate: -1 });

    res.json({
      success: true,
      data: notices
    });
  } catch (err) {
    console.error('Error fetching notices:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notices'
    });
  }
};

// Get notice by ID
exports.getNoticeById = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const notice = await Notice.findOne({ _id: id, schoolId })
      .populate('postedBy', 'firstName lastName email');

    if (!notice) {
      return res.status(404).json({
        success: false,
        error: 'Notice not found'
      });
    }

    res.json({
      success: true,
      data: notice
    });
  } catch (err) {
    console.error('Error fetching notice:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notice'
    });
  }
};

// Create notice
exports.createNotice = async (req, res) => {
  try {
    const { schoolId, userId } = req.user;
    const { title, description, type, expiryDate, targetAudience, attachments, isPinned } = req.body;

    const newNotice = new Notice({
      schoolId,
      title,
      description,
      type: type || 'general',
      expiryDate,
      targetAudience: targetAudience || ['all'],
      attachments: attachments || [],
      postedBy: userId,
      isPinned: isPinned || false
    });

    await newNotice.save();

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: newNotice
    });
  } catch (err) {
    console.error('Error creating notice:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create notice'
    });
  }
};

// Update notice
exports.updateNotice = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const notice = await Notice.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!notice) {
      return res.status(404).json({
        success: false,
        error: 'Notice not found'
      });
    }

    res.json({
      success: true,
      message: 'Notice updated successfully',
      data: notice
    });
  } catch (err) {
    console.error('Error updating notice:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update notice'
    });
  }
};

// Delete notice (soft delete)
exports.deleteNotice = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const notice = await Notice.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({
        success: false,
        error: 'Notice not found'
      });
    }

    res.json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting notice:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notice'
    });
  }
};

// Pin/Unpin notice
exports.togglePin = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const notice = await Notice.findOne({ _id: id, schoolId });

    if (!notice) {
      return res.status(404).json({
        success: false,
        error: 'Notice not found'
      });
    }

    notice.isPinned = !notice.isPinned;
    await notice.save();

    res.json({
      success: true,
      message: `Notice ${notice.isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: notice
    });
  } catch (err) {
    console.error('Error toggling pin:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update notice'
    });
  }
};
