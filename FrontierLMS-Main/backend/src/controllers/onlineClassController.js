// controllers/onlineClassController.js
const OnlineClass = require('../models/OnlineClass');
const Class = require('../models/Class');

// Get all online classes
exports.getAllOnlineClasses = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { classId, status, startDate, endDate } = req.query;

    const query = { schoolId };
    if (classId) query.classId = classId;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    const onlineClasses = await OnlineClass.find(query)
      .populate('classId', 'name section')
      .populate('teacherId', 'firstName lastName')
      .populate('attendance.studentId', 'firstName lastName rollNumber')
      .sort({ scheduledDate: -1 });

    res.json({
      success: true,
      data: onlineClasses
    });
  } catch (err) {
    console.error('Error fetching online classes:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch online classes'
    });
  }
};

// Get online classes for teacher
exports.getTeacherOnlineClasses = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { status } = req.query;

    const query = {
      schoolId,
      teacherId: userId
    };

    if (status) query.status = status;

    const onlineClasses = await OnlineClass.find(query)
      .populate('classId', 'name section')
      .sort({ scheduledDate: -1 });

    res.json({
      success: true,
      data: onlineClasses
    });
  } catch (err) {
    console.error('Error fetching teacher online classes:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch online classes'
    });
  }
};

// Get online classes for parent/student
exports.getStudentOnlineClasses = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({
        success: false,
        error: 'Class ID is required'
      });
    }

    const onlineClasses = await OnlineClass.find({
      schoolId,
      classId,
      status: { $in: ['scheduled', 'ongoing'] }
    })
      .populate('teacherId', 'firstName lastName')
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      data: onlineClasses
    });
  } catch (err) {
    console.error('Error fetching student online classes:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch online classes'
    });
  }
};

// Create online class
exports.createOnlineClass = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const {
      classId,
      subject,
      title,
      description,
      scheduledDate,
      startTime,
      endTime,
      meetingLink,
      meetingId,
      meetingPassword,
      platform
    } = req.body;

    const newOnlineClass = new OnlineClass({
      schoolId,
      classId,
      teacherId: userId,
      subject,
      title,
      description,
      scheduledDate,
      startTime,
      endTime,
      meetingLink,
      meetingId,
      meetingPassword,
      platform: platform || 'zoom',
      status: 'scheduled'
    });

    await newOnlineClass.save();

    res.status(201).json({
      success: true,
      message: 'Online class created successfully',
      data: newOnlineClass
    });
  } catch (err) {
    console.error('Error creating online class:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create online class'
    });
  }
};

// Update online class
exports.updateOnlineClass = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { id } = req.params;

    const onlineClass = await OnlineClass.findOneAndUpdate(
      { _id: id, teacherId: userId, schoolId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!onlineClass) {
      return res.status(404).json({
        success: false,
        error: 'Online class not found'
      });
    }

    res.json({
      success: true,
      message: 'Online class updated successfully',
      data: onlineClass
    });
  } catch (err) {
    console.error('Error updating online class:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update online class'
    });
  }
};

// Delete online class
exports.deleteOnlineClass = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { id } = req.params;

    const onlineClass = await OnlineClass.findOneAndDelete({
      _id: id,
      teacherId: userId,
      schoolId
    });

    if (!onlineClass) {
      return res.status(404).json({
        success: false,
        error: 'Online class not found'
      });
    }

    res.json({
      success: true,
      message: 'Online class deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting online class:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete online class'
    });
  }
};

// Record attendance for online class
exports.recordAttendance = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { id } = req.params;
    const { studentId, joinedAt, leftAt, duration } = req.body;

    const onlineClass = await OnlineClass.findOne({
      _id: id,
      teacherId: userId,
      schoolId
    });

    if (!onlineClass) {
      return res.status(404).json({
        success: false,
        error: 'Online class not found'
      });
    }

    // Check if student already has attendance record
    const existingIndex = onlineClass.attendance.findIndex(
      a => a.studentId.toString() === studentId
    );

    if (existingIndex >= 0) {
      // Update existing record
      onlineClass.attendance[existingIndex] = {
        studentId,
        joinedAt,
        leftAt,
        duration
      };
    } else {
      // Add new record
      onlineClass.attendance.push({
        studentId,
        joinedAt,
        leftAt,
        duration
      });
    }

    await onlineClass.save();

    res.json({
      success: true,
      message: 'Attendance recorded successfully'
    });
  } catch (err) {
    console.error('Error recording attendance:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to record attendance'
    });
  }
};
