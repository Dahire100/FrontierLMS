const mongoose = require('mongoose');
const Message = require('../models/Communication');
const CommunicationLog = require('../models/CommunicationLog');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Staff = require('../models/Staff');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const emailService = require('../utils/emailService');

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
      .lean();

    const broadcasts = await CommunicationLog.find({
      schoolId,
      senderId: userId
    }).lean();

    // Standardize structure
    const allMessages = [
      ...messages.map(m => ({
        _id: m._id,
        recipientRole: 'Individual (Internal)', // or fetch detailed role
        recipientName: m.recipientId?.firstName ? `${m.recipientId.firstName} ${m.recipientId.lastName}` : 'Unknown',
        type: 'Internal',
        subject: m.subject,
        message: m.message,
        status: m.isRead ? 'Read' : 'Unread',
        createdAt: m.createdAt
      })),
      ...broadcasts.map(b => ({
        _id: b._id,
        recipientRole: b.recipientRole || b.recipient,
        recipientName: b.recipientName || b.recipient,
        type: b.type, // 'email' or 'sms'
        subject: b.title,
        message: b.message,
        status: b.status,
        createdAt: b.sentAt || b.createdAt
      }))
    ];

    allMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: allMessages
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

// Send Broadcast (Email/SMS)
exports.sendBroadcast = async (req, res) => {
  try {
    const { schoolId, _id: senderId } = req.user;
    const { title, message, sendThrough, criteria, selectedRoles, classId, section, specificEmails } = req.body;
    // sendThrough: ['email', 'sms']
    // criteria: 'group', 'class', 'individual'

    if (!title || !message || !sendThrough || sendThrough.length === 0) {
      return res.status(400).json({ success: false, error: 'Title, Message and Channel are required' });
    }

    let recipients = [];

    // 1. Fetch Recipients
    if (criteria === 'group' && selectedRoles && selectedRoles.length > 0) {
      // Mapping detailed roles to DB queries
      const queries = [];
      const roles = selectedRoles.map(r => r.toLowerCase());

      if (roles.includes('student')) queries.push(Student.find({ schoolId }).select('email firstName lastName guardianPhone'));
      if (roles.includes('teacher')) queries.push(Teacher.find({ schoolId }).select('email firstName lastName phone'));
      if (roles.includes('admin') || roles.includes('super admin')) queries.push(User.find({ schoolId, role: { $in: ['admin', 'super_admin', 'school_admin'] } }).select('email firstName lastName phone'));
      if (roles.includes('parent') || roles.includes('guardians')) queries.push(Student.find({ schoolId }).select('guardianEmail guardianName guardianPhone')); // Simplified: getting guardian info from student

      // Generic Staff roles
      if (roles.some(r => !['student', 'teacher', 'admin', 'parent'].includes(r))) {
        // Try fetching from Staff for other roles
        queries.push(Staff.find({ schoolId }).select('email firstName lastName phone'));
      }

      const results = await Promise.all(queries);
      results.flat().forEach(doc => {
        if (doc.email) recipients.push({ email: doc.email, name: doc.firstName || doc.guardianName, phone: doc.phone || doc.guardianPhone, role: 'group_member' });
        // Handle Guardian Email specifically if pulling from Student for Parent role
        if (doc.guardianEmail && (roles.includes('parent') || roles.includes('guardians'))) {
          recipients.push({ email: doc.guardianEmail, name: doc.guardianName, phone: doc.guardianPhone, role: 'parent' });
        }
      });

    } else if (criteria === 'class' && classId) {
      const query = { schoolId, class: classId };
      if (section) query.section = section;
      const students = await Student.find(query).select('email firstName lastName guardianEmail guardianName guardianPhone');

      students.forEach(s => {
        if (s.email) recipients.push({ email: s.email, name: `${s.firstName} ${s.lastName}`, role: 'student' });
        // Optionally include parents? Usually "Class" broadcast implies students, but let's stick to students unless specified
      });

    } else if (criteria === 'individual' && specificEmails) {
      // specificEmails can be comma separated string or array
      const list = Array.isArray(specificEmails) ? specificEmails : specificEmails.split(',').map(e => e.trim());
      list.forEach(email => recipients.push({ email, name: 'Individual', role: 'individual' }));
    }

    // Deduplicate recipients by email
    const uniqueRecipients = [];
    const seenEmails = new Set();
    recipients.forEach(r => {
      if (r.email && !seenEmails.has(r.email)) {
        seenEmails.add(r.email);
        uniqueRecipients.push(r);
      }
    });

    if (uniqueRecipients.length === 0) {
      return res.status(404).json({ success: false, error: 'No valid recipients found' });
    }

    // 2. Send Messages
    const sendPromises = [];

    // Email
    if (sendThrough.includes('email')) {
      uniqueRecipients.forEach(r => {
        sendPromises.push((async () => {
          try {
            await emailService.sendEmail({ to: r.email, subject: title, html: message });
            await CommunicationLog.create({
              schoolId, senderId, type: 'email', recipient: r.email, recipientName: r.name, recipientRole: r.role,
              title, message, status: 'sent'
            });
          } catch (err) {
            await CommunicationLog.create({
              schoolId, senderId, type: 'email', recipient: r.email, recipientName: r.name, recipientRole: r.role,
              title, message, status: 'failed', error: err.message
            });
          }
        })());
      });
    }

    // SMS (Mock)
    if (sendThrough.includes('sms')) {
      uniqueRecipients.forEach(r => {
        sendPromises.push((async () => {
          // Mock SMS sending
          const status = r.phone ? 'sent' : 'failed'; // Fail if no phone
          const error = r.phone ? null : 'No phone number';
          await CommunicationLog.create({
            schoolId, senderId, type: 'sms', recipient: r.phone || r.email + '(no-phone)', recipientName: r.name, recipientRole: r.role,
            title, message, status, error
          });
        })());
      });
    }

    // Determine basic success without waiting for all (fire and forget pattern optional, but let's wait for stability)
    // Actually, waiting for 100 emails might timeout. Let's process in background or wait? 
    // For now, wait Promise.all (might need chunking for production)
    await Promise.all(sendPromises);

    res.json({
      success: true,
      message: `Broadcast initiated for ${uniqueRecipients.length} recipients.`,
      recipientCount: uniqueRecipients.length
    });

  } catch (err) {
    console.error('Broadcast Error:', err);
    res.status(500).json({ success: false, error: 'Failed to broadcast message' });
  }
};
