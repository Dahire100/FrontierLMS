const Message = require('../models/Communication');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Staff = require('../models/Staff');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { _id: userId, schoolId, role: senderType } = req.user;
    let { recipientId, recipientType, recipientEmail, subject, message, body, attachments, priority } = req.body;

    // Support 'body' as alias for 'message' (frontend uses 'body')
    if (!message && body) message = body;

    // Resolve recipientId by email if provided
    if (!recipientId && recipientEmail) {
      // 1. Check User collection (primary)
      let recipient = await User.findOne({ email: recipientEmail, schoolId });

      if (!recipient) {
        // 2. Check Teacher collection
        recipient = await Teacher.findOne({ email: recipientEmail, schoolId });
        if (recipient) recipient.role = 'teacher';
      }

      if (!recipient) {
        // 3. Check Staff collection
        recipient = await Staff.findOne({ email: recipientEmail, schoolId });
        // staff role is already on the document
      }

      if (recipient) {
        recipientId = recipient._id;
        recipientType = recipientType || recipient.role;
      } else {
        return res.status(404).json({ success: false, error: 'Recipient not found' });
      }
    }

    if (!recipientId || !message) {
      return res.status(400).json({ success: false, error: 'Recipient and message body are required' });
    }

    const newMessage = new Message({
      schoolId,
      senderId: userId,
      senderType: senderType || req.user.role,
      recipientId,
      recipientType: recipientType || 'admin',
      subject,
      message,
      attachments: attachments || [],
      priority: priority || 'medium'
    });

    await newMessage.save();

    // Create Notification for recipient
    try {
      const { firstName, lastName } = req.user;
      const senderName = firstName ? `${firstName} ${lastName || ''}` : (senderType || req.user.role);

      // Map roles to dashboard paths
      let rolePath = recipientType || 'admin';
      if (rolePath === 'school_admin') rolePath = 'admin';
      if (rolePath === 'super_admin') rolePath = 'super-admin';

      const notification = new Notification({
        recipient: recipientId,
        schoolId,
        title: `New Message from ${senderName}`,
        message: subject || (message.length > 50 ? message.substring(0, 47) + '...' : message),
        type: 'info',
        link: `/dashboard/${rolePath}/communication/inbox`
      });
      await notification.save();
    } catch (notifErr) {
      console.error('Failed to create notification for message:', notifErr);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};

// Get inbox messages
exports.getInbox = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { isRead } = req.query;

    const query = {
      schoolId,
      recipientId: userId
    };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const messages = await Message.find(query)
      .populate('senderId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: messages
    });
  } catch (err) {
    console.error('Error fetching inbox:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
};

// Get sent messages
exports.getSentMessages = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;

    const messages = await Message.find({
      schoolId,
      senderId: userId
    })
      .populate('recipientId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: messages
    });
  } catch (err) {
    console.error('Error fetching sent messages:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
};

// Get message by ID
exports.getMessageById = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { id } = req.params;

    const message = await Message.findOne({
      _id: id,
      schoolId,
      $or: [
        { senderId: userId },
        { recipientId: userId }
      ]
    })
      .populate('senderId', 'firstName lastName email')
      .populate('recipientId', 'firstName lastName email');

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    // Mark as read if recipient is viewing
    if (message.recipientId._id.toString() === userId && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }

    res.json({
      success: true,
      data: message
    });
  } catch (err) {
    console.error('Error fetching message:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch message'
    });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { id } = req.params;

    const message = await Message.findOneAndUpdate(
      {
        _id: id,
        schoolId,
        recipientId: userId,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (err) {
    console.error('Error marking message as read:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update message'
    });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { id } = req.params;

    const message = await Message.findOneAndDelete({
      _id: id,
      schoolId,
      $or: [
        { senderId: userId },
        { recipientId: userId }
      ]
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message'
    });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;

    const count = await Message.countDocuments({
      schoolId,
      recipientId: userId,
      isRead: false
    });

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count'
    });
  }
};

// Get available recipients
exports.getRecipients = async (req, res) => {
  try {
    const { schoolId } = req.user;
    if (!schoolId) {
      console.warn('getRecipients: No schoolId found in req.user');
      return res.json({ success: true, data: [] });
    }

    const sidString = schoolId.toString();
    let sid = schoolId;
    try {
      if (mongoose.isValidObjectId(sidString)) {
        sid = new mongoose.Types.ObjectId(sidString);
      }
    } catch (e) {
      console.error('Error casting schoolId:', e);
    }

    console.log(`🔍 getRecipients: Filtering for schoolId: ${sidString}`);

    // Fetch only from the user's school
    const [teachers, staffMembers, users] = await Promise.all([
      Teacher.find({ $or: [{ schoolId: sid }, { schoolId: sidString }] }).select('_id firstName lastName email').lean(),
      Staff.find({ $or: [{ schoolId: sid }, { schoolId: sidString }] }).select('_id firstName lastName email role').lean(),
      User.find({
        $or: [
          { schoolId: sid },
          { schoolId: sidString },
          { role: 'super_admin' }
        ],
        role: { $in: ['school_admin', 'teacher', 'admin', 'super_admin'] }
      }).select('_id firstName lastName email role').lean()
    ]);

    const all = [
      ...teachers.map(t => ({ _id: t._id, firstName: t.firstName, lastName: t.lastName, email: t.email, role: 'teacher' })),
      ...staffMembers.map(s => ({ _id: s._id, firstName: s.firstName, lastName: s.lastName, email: s.email, role: s.role })),
      ...users.map(u => ({ _id: u._id, firstName: u.firstName || 'User', lastName: u.lastName || '', email: u.email, role: u.role }))
    ];

    const uniqueMap = new Map();
    all.forEach(item => {
      if (item.email && !uniqueMap.has(item.email)) {
        uniqueMap.set(item.email, item);
      }
    });

    const finalRecipients = Array.from(uniqueMap.values());
    console.log(`✅ getRecipients: Returning ${finalRecipients.length} recipients for school ${sidString}`);

    return res.json({
      success: true,
      data: finalRecipients
    });
  } catch (err) {
    console.error('Error fetching recipients:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch recipients' });
  }
};
