// controllers/leaveController.js
const LeaveRequest = require('../models/LeaveRequest');
const LeaveType = require('../models/LeaveType');
const Student = require('../models/Student');

// Get all leave requests (admin view)
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { status, requesterType } = req.query;

    const query = { schoolId };
    if (status) query.status = status;
    if (requesterType) query.requesterType = requesterType;

    const leaveRequests = await LeaveRequest.find(query)
      .populate('studentId', 'firstName lastName studentId rollNumber')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    const formatted = leaveRequests.map((leave) => {
      const student = leave.studentId || null;
      return {
        ...leave.toObject(),
        student,
        requesterId: student,
        leaveType: { name: leave.leaveType }
      };
    });

    res.json({
      success: true,
      data: formatted
    });
  } catch (err) {
    console.error('Error fetching leave requests:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leave requests'
    });
  }
};

// Get user's leave requests
exports.getMyLeaveRequests = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { status } = req.query;

    const query = {
      schoolId,
      requesterId: userId
    };

    if (status) query.status = status;

    const leaveRequests = await LeaveRequest.find(query)
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: leaveRequests
    });
  } catch (err) {
    console.error('Error fetching leave requests:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leave requests'
    });
  }
};

// Create leave request
exports.createLeaveRequest = async (req, res) => {
  try {
    const { userId, schoolId, role } = req.user;
    const { leaveType, leaveTypeId, studentId, startDate, endDate, reason, attachments } = req.body;

    const normalizeLeaveType = (value) => {
      if (!value) return null;
      const v = `${value}`.trim().toLowerCase();
      const allowed = ['sick', 'casual', 'emergency', 'vacation', 'medical', 'other'];
      if (allowed.includes(v)) return v;
      if (v.includes('sick')) return 'sick';
      if (v.includes('casual')) return 'casual';
      if (v.includes('emergency')) return 'emergency';
      if (v.includes('vacation')) return 'vacation';
      if (v.includes('medical')) return 'medical';
      return 'other';
    };

    let resolvedLeaveType = normalizeLeaveType(leaveType);
    if (!resolvedLeaveType && leaveTypeId) {
      const typeDoc = await LeaveType.findOne({ _id: leaveTypeId, schoolId });
      if (!typeDoc) {
        return res.status(400).json({ success: false, error: 'Invalid leave type' });
      }
      resolvedLeaveType = normalizeLeaveType(typeDoc.name) || 'other';
    }

    const allowedRequesterTypes = ['teacher', 'student', 'staff', 'parent'];
    const isRoleAllowed = allowedRequesterTypes.includes(role);

    let requesterType = isRoleAllowed ? role : null;
    let requesterId = userId;
    let effectiveStudentId = null;

    if (studentId) {
      const studentDoc = await Student.findOne({ _id: studentId, schoolId });
      if (!studentDoc) {
        return res.status(400).json({ success: false, error: 'Invalid student' });
      }
      requesterType = 'student';
      requesterId = studentId;
      effectiveStudentId = studentId;
    }

    if (!requesterType) {
      return res.status(400).json({ success: false, error: 'Invalid requester type' });
    }

    if (!resolvedLeaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, error: 'leaveType, startDate, endDate, and reason are required' });
    }

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const newLeaveRequest = new LeaveRequest({
      schoolId,
      ...(effectiveStudentId && { studentId: effectiveStudentId }),
      requesterId,
      requesterType,
      leaveType: resolvedLeaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      attachments: attachments || [],
      status: 'pending'
    });

    await newLeaveRequest.save();

    const populated = await LeaveRequest.findById(newLeaveRequest._id)
      .populate('studentId', 'firstName lastName studentId rollNumber')
      .populate('approvedBy', 'firstName lastName');

    const student = populated ? populated.studentId : null;

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: populated ? {
        ...populated.toObject(),
        student,
        requesterId: student,
        leaveType: { name: populated.leaveType }
      } : newLeaveRequest
    });
  } catch (err) {
    console.error('Error creating leave request:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create leave request'
    });
  }
};

// Update leave request
exports.updateLeaveRequest = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { id } = req.params;

    // Only allow update if pending
    const leaveRequest = await LeaveRequest.findOne({
      _id: id,
      requesterId: userId,
      schoolId,
      status: 'pending'
    });

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        error: 'Leave request not found or cannot be updated'
      });
    }

    // Recalculate total days if dates changed
    if (req.body.startDate || req.body.endDate) {
      const start = new Date(req.body.startDate || leaveRequest.startDate);
      const end = new Date(req.body.endDate || leaveRequest.endDate);
      req.body.totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    Object.assign(leaveRequest, req.body);
    await leaveRequest.save();

    res.json({
      success: true,
      message: 'Leave request updated successfully',
      data: leaveRequest
    });
  } catch (err) {
    console.error('Error updating leave request:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update leave request'
    });
  }
};

// Cancel leave request
exports.cancelLeaveRequest = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { id } = req.params;

    const leaveRequest = await LeaveRequest.findOneAndUpdate(
      {
        _id: id,
        requesterId: userId,
        schoolId,
        status: { $in: ['pending', 'approved'] }
      },
      {
        $set: { status: 'cancelled' }
      },
      { new: true }
    );

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        error: 'Leave request not found or cannot be cancelled'
      });
    }

    res.json({
      success: true,
      message: 'Leave request cancelled successfully'
    });
  } catch (err) {
    console.error('Error cancelling leave request:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel leave request'
    });
  }
};

// Approve leave request (admin/teacher)
exports.approveLeaveRequest = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { id } = req.params;
    const { approvalRemarks } = req.body;

    const leaveRequest = await LeaveRequest.findOneAndUpdate(
      {
        _id: id,
        schoolId,
        status: 'pending'
      },
      {
        $set: {
          status: 'approved',
          approvedBy: userId,
          approvalDate: new Date(),
          approvalRemarks
        }
      },
      { new: true }
    );

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        error: 'Leave request not found or already processed'
      });
    }

    res.json({
      success: true,
      message: 'Leave request approved successfully',
      data: leaveRequest
    });
  } catch (err) {
    console.error('Error approving leave request:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to approve leave request'
    });
  }
};

// Reject leave request (admin/teacher)
exports.rejectLeaveRequest = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const leaveRequest = await LeaveRequest.findOneAndUpdate(
      {
        _id: id,
        schoolId,
        status: 'pending'
      },
      {
        $set: {
          status: 'rejected',
          approvedBy: userId,
          approvalDate: new Date(),
          rejectionReason
        }
      },
      { new: true }
    );

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        error: 'Leave request not found or already processed'
      });
    }

    res.json({
      success: true,
      message: 'Leave request rejected',
      data: leaveRequest
    });
  } catch (err) {
    console.error('Error rejecting leave request:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to reject leave request'
    });
  }
};

// Delete leave request
exports.deleteLeaveRequest = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { id } = req.params;

    const leaveRequest = await LeaveRequest.findOneAndDelete({
      _id: id,
      requesterId: userId,
      schoolId,
      status: 'pending'
    });

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        error: 'Leave request not found or cannot be deleted'
      });
    }

    res.json({
      success: true,
      message: 'Leave request deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting leave request:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete leave request'
    });
  }
};


// Get leave summary
exports.getLeaveSummary = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { requesterType } = req.query; // 'student'

    const mongoose = require('mongoose');
    const query = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      status: 'approved'
    };
    if (requesterType) query.requesterType = requesterType;

    const summary = await LeaveRequest.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$requesterId",
          sick: { $sum: { $cond: [{ $eq: ["$leaveType", "sick"] }, "$totalDays", 0] } },
          casual: { $sum: { $cond: [{ $eq: ["$leaveType", "casual"] }, "$totalDays", 0] } },
          emergency: { $sum: { $cond: [{ $eq: ["$leaveType", "emergency"] }, "$totalDays", 0] } },
          medical: { $sum: { $cond: [{ $eq: ["$leaveType", "medical"] }, "$totalDays", 0] } },
          other: { $sum: { $cond: [{ $eq: ["$leaveType", "other"] }, "$totalDays", 0] } },
          total: { $sum: "$totalDays" }
        }
      },
      // Lookup user details (Student)
      {
        $lookup: {
          from: "students", // Default collection name for Student model
          localField: "_id",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      {
        $project: {
          _id: 1,
          firstName: { $arrayElemAt: ["$studentInfo.firstName", 0] },
          lastName: { $arrayElemAt: ["$studentInfo.lastName", 0] },
          sick: 1,
          casual: 1,
          emergency: 1,
          medical: 1,
          other: 1,
          total: 1
        }
      }
    ]);

    // Filter out those where studentInfo lookup failed (e.g. if requester was not student but query didn't filter correctly, or student deleted)
    // If requesterType is student, we expect studentInfo to be populated.

    res.json({
      success: true,
      data: summary
    });
  } catch (err) {
    console.error('Error fetching leave summary:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch leave summary' });
  }
};
