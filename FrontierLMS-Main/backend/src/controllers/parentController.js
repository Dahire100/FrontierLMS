// controllers/parentController.js
const Student = require('../models/Student');
const StudentFee = require('../models/StudentFee');
const Homework = require('../models/Homework');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const StudentProgress = require('../models/StudentProgress');
const Notice = require('../models/Notice');
const { IssueRecord } = require('../models/Library');
const TransportRoute = require('../models/TransportRoute');
const { HostelAllocation } = require('../models/Hostel');
const StudentDocument = require('../models/StudentDocument');
const StudyMaterial = require('../models/StudyMaterial');
const HostelOutpass = require('../models/HostelOutpass');
const LeaveRequest = require('../models/LeaveRequest');
const Timetable = require('../models/Timetable');
const OnlineClass = require('../models/OnlineClass');
const User = require('../models/User');
const Class = require('../models/Class');

// Get parent dashboard
exports.getParentDashboard = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;

    // Find all children linked to this parent
    const children = await Student.find({
      schoolId,
      $or: [
        { parentEmail: req.user.email },
        { 'parent.email': req.user.email }
      ]
    })
      .populate('class', 'name section')
      .select('firstName lastName rollNumber class admissionDate profilePicture');

    if (!children || children.length === 0) {
      return res.json({
        success: true,
        data: {
          children: [],
          stats: {
            totalChildren: 0,
            totalPendingFees: 0,
            upcomingExams: 0,
            unreadNotices: 0
          }
        }
      });
    }

    const studentIds = children.map(c => c._id);

    // Get fee statistics
    const pendingFees = await StudentFee.find({
      studentId: { $in: studentIds },
      status: 'pending'
    });
    const totalPendingFees = pendingFees.reduce((sum, fee) => sum + fee.amount, 0);

    // Get upcoming exams
    const upcomingExams = await Exam.countDocuments({
      schoolId,
      date: { $gte: new Date() }
    });

    // Get unread notices
    const unreadNotices = await Notice.countDocuments({
      schoolId,
      isActive: true,
      targetAudience: { $in: ['all', 'parents'] },
      publishedDate: { $lte: new Date() }
    });

    // Get detailed info for each child
    const childrenWithDetails = await Promise.all(
      children.map(async (child) => {
        // Get attendance
        const attendanceRecords = await Attendance.find({
          classId: child.class._id,
          'students.studentId': child._id,
          date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        let present = 0, absent = 0;
        attendanceRecords.forEach(record => {
          const studentAttendance = record.students.find(
            s => s.studentId.toString() === child._id.toString()
          );
          if (studentAttendance) {
            if (studentAttendance.status === 'present') present++;
            else if (studentAttendance.status === 'absent') absent++;
          }
        });

        const total = present + absent;
        const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0;

        // Get pending homework
        const pendingHomework = await Homework.countDocuments({
          classId: child.class._id,
          status: 'active',
          dueDate: { $gte: new Date() },
          'submissions.studentId': { $ne: child._id }
        });

        // Get pending homework list
        const pendingHomeworkList = await Homework.find({
          classId: child.class._id,
          status: 'active',
          dueDate: { $gte: new Date() },
          'submissions.studentId': { $ne: child._id }
        }).limit(3).select('title subject dueDate').lean();

        // Get upcoming exams list
        const upcomingExamsList = await Exam.find({
          schoolId,
          classId: child.class._id,
          date: { $gte: new Date() }
        }).limit(3).sort({ date: 1 }).select('examName date type').lean();

        // Get pending fees
        const childFees = await StudentFee.find({
          studentId: child._id,
          status: 'pending'
        });
        const childPendingFees = childFees.reduce((sum, fee) => sum + fee.amount, 0);

        // Get latest exam results
        const latestResult = await ExamResult.findOne({
          studentId: child._id
        })
          .populate('examId', 'examName')
          .sort({ createdAt: -1 });

        return {
          ...child.toObject(),
          attendance: {
            present,
            absent,
            total,
            percentage: attendancePercentage
          },
          pendingHomework,
          pendingHomeworkList,
          upcomingExamsList,
          pendingFees: childPendingFees,
          latestResult: latestResult ? {
            examName: latestResult.examId.examName,
            totalMarks: latestResult.totalMarks,
            obtainedMarks: latestResult.obtainedMarks,
            percentage: latestResult.percentage,
            grade: latestResult.grade
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: {
        children: childrenWithDetails,
        stats: {
          totalChildren: children.length,
          totalPendingFees,
          upcomingExams,
          unreadNotices
        }
      }
    });
  } catch (err) {
    console.error('Error fetching parent dashboard:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
};

// Get child details
exports.getChildDetails = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { studentId } = req.params;

    const student = await Student.findOne({
      _id: studentId,
      schoolId,
      $or: [
        { parentEmail: req.user.email },
        { 'parent.email': req.user.email }
      ]
    }).populate('class', 'name section');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found or access denied'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (err) {
    console.error('Error fetching child details:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch child details'
    });
  }
};

// Get child attendance
exports.getChildAttendance = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify parent has access
    const student = await Student.findOne({
      _id: studentId,
      schoolId,
      $or: [
        { parentEmail: req.user.email },
        { 'parent.email': req.user.email }
      ]
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const query = {
      classId: student.class,
      'students.studentId': studentId
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendanceRecords = await Attendance.find(query).sort({ date: -1 });

    const formattedRecords = attendanceRecords.map(record => {
      const studentAttendance = record.students.find(
        s => s.studentId.toString() === studentId
      );
      return {
        date: record.date,
        status: studentAttendance ? studentAttendance.status : 'unknown',
        remarks: studentAttendance ? studentAttendance.remarks : ''
      };
    });

    // Calculate statistics
    const present = formattedRecords.filter(r => r.status === 'present').length;
    const absent = formattedRecords.filter(r => r.status === 'absent').length;
    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        records: formattedRecords,
        statistics: {
          present,
          absent,
          total,
          percentage
        }
      }
    });
  } catch (err) {
    console.error('Error fetching child attendance:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance'
    });
  }
};

// Get child homework
exports.getChildHomework = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { studentId } = req.params;
    const { status } = req.query;

    // Verify parent has access
    const student = await Student.findOne({
      _id: studentId,
      schoolId,
      $or: [
        { parentEmail: req.user.email },
        { 'parent.email': req.user.email }
      ]
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Find the Class ID
    const studentClassDoc = await Class.findOne({
      schoolId,
      name: student.class,
      section: student.section
    });

    const query = { schoolId };
    if (studentClassDoc) {
      query.classId = studentClassDoc._id;
    } else {
      // If class not found by name, we can't find homework by classId
      return res.json({ success: true, data: [] });
    }

    if (status) query.status = status;

    const homework = await Homework.find(query)
      .populate('assignedBy', 'firstName lastName')
      .sort({ dueDate: -1 });

    // Add submission status for this student
    const homeworkWithStatus = homework.map(hw => {
      const submission = hw.submissions.find(
        s => s.studentId.toString() === studentId
      );

      return {
        ...hw.toObject(),
        studentSubmission: submission ? {
          status: submission.status,
          submittedAt: submission.submittedAt,
          marks: submission.marks,
          feedback: submission.feedback
        } : null
      };
    });

    res.json({
      success: true,
      data: homeworkWithStatus
    });
  } catch (err) {
    console.error('Error fetching child homework:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch homework'
    });
  }
};

// Get child exam results
exports.getChildExamResults = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { studentId } = req.params;

    // Verify parent has access
    const student = await Student.findOne({
      _id: studentId,
      schoolId,
      $or: [
        { parentEmail: req.user.email },
        { 'parent.email': req.user.email }
      ]
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const results = await ExamResult.find({ studentId })
      .populate('examId', 'examName examDate class subject totalMarks')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error('Error fetching exam results:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exam results'
    });
  }
};

// Get child fees
exports.getChildFees = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { studentId } = req.params;

    // Verify parent has access
    const student = await Student.findOne({
      _id: studentId,
      schoolId,
      $or: [
        { parentEmail: req.user.email },
        { 'parent.email': req.user.email }
      ]
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const fees = await StudentFee.find({ studentId })
      .sort({ dueDate: -1 });

    // Calculate totals
    const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidAmount = fees
      .filter(f => f.status === 'paid')
      .reduce((sum, fee) => sum + fee.amount, 0);
    const pendingAmount = totalAmount - paidAmount;

    res.json({
      success: true,
      data: {
        fees,
        summary: {
          totalAmount,
          paidAmount,
          pendingAmount,
          totalRecords: fees.length
        }
      }
    });
  } catch (err) {
    console.error('Error fetching child fees:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fees'
    });
  }
};

// Get child progress report
exports.getChildProgress = async (req, res) => {
  try {
    const { userId, schoolId } = req.user;
    const { studentId } = req.params;
    const { academicYear, term } = req.query;

    // Verify parent has access
    const student = await Student.findOne({
      _id: studentId,
      schoolId,
      $or: [
        { parentEmail: req.user.email },
        { 'parent.email': req.user.email }
      ]
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const query = { studentId };
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;

    const progressReports = await StudentProgress.find(query)
      .sort({ academicYear: -1, term: -1 });

    res.json({
      success: true,
      data: progressReports
    });
  } catch (err) {
    console.error('Error fetching child progress:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress report'
    });
  }
};

// Get notices for parents
exports.getParentNotices = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { type } = req.query;

    const query = {
      schoolId,
      isActive: true,
      targetAudience: { $in: ['all', 'parents'] },
      publishedDate: { $lte: new Date() }
    };

    if (type) query.type = type;

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

// ===== NEW FEATURES FOR PARENTS =====

// Get child timetable
exports.getChildTimetable = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId } = req.params;

    // Verify access
    const student = await Student.findOne({ _id: studentId, schoolId, $or: [{ parentEmail: req.user.email }, { 'parent.email': req.user.email }] });
    if (!student) return res.status(403).json({ error: 'Access denied' });

    // Find the Class ID
    const studentClassDoc = await Class.findOne({
      schoolId,
      name: student.class,
      section: student.section
    });

    if (!studentClassDoc) {
      return res.json({ success: true, data: [] });
    }

    const timetable = await Timetable.find({ schoolId, classId: studentClassDoc._id, isActive: true })
      .populate('periods.teacher', 'firstName lastName email');

    res.json({ success: true, data: timetable });
  } catch (err) {
    console.error('Error fetching timetable:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch timetable' });
  }
};

// Get child library history
exports.getChildLibraryHistory = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId } = req.params;

    const student = await Student.findOne({ _id: studentId, schoolId, $or: [{ parentEmail: req.user.email }, { 'parent.email': req.user.email }] });
    if (!student) return res.status(403).json({ error: 'Access denied' });

    const records = await IssueRecord.find({ schoolId, 'issuedTo.userId': studentId })
      .populate('bookId', 'title author')
      .sort({ issueDate: -1 });
    res.json({ success: true, data: records });
  } catch (err) {
    console.error('Error fetching library history:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch library history' });
  }
};

// Get child transport
exports.getChildTransport = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId } = req.params;

    const student = await Student.findOne({ _id: studentId, schoolId, $or: [{ parentEmail: req.user.email }, { 'parent.email': req.user.email }] });
    if (!student) return res.status(403).json({ error: 'Access denied' });

    if (!student.transportRoute) return res.json({ success: true, data: null });

    const route = await TransportRoute.findOne({ schoolId, routeName: student.transportRoute });
    res.json({ success: true, data: route });
  } catch (err) {
    console.error('Error fetching transport:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch transport' });
  }
};

// Get child hostel
exports.getChildHostel = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId } = req.params;

    const student = await Student.findOne({ _id: studentId, schoolId, $or: [{ parentEmail: req.user.email }, { 'parent.email': req.user.email }] });
    if (!student) return res.status(403).json({ error: 'Access denied' });

    const allocation = await HostelAllocation.findOne({ schoolId, studentId, status: 'active' })
      .populate('hostelId')
      .populate('roomId');
    res.json({ success: true, data: allocation });
  } catch (err) {
    console.error('Error fetching hostel:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch hostel' });
  }
};

// Get child downloads
exports.getChildDownloads = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId } = req.params;

    const student = await Student.findOne({ _id: studentId, schoolId, $or: [{ parentEmail: req.user.email }, { 'parent.email': req.user.email }] });
    if (!student) return res.status(403).json({ error: 'Access denied' });

    // Find the Class ID
    const studentClassDoc = await Class.findOne({
      schoolId,
      name: student.class,
      section: student.section
    });

    if (!studentClassDoc) {
      return res.json({ success: true, data: [] });
    }

    const materials = await StudyMaterial.find({
      schoolId,
      isActive: true,
      $or: [
        { classes: { $size: 0 } },
        { classes: studentClassDoc._id }
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: materials });
  } catch (err) {
    console.error('Error fetching downloads:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch downloads' });
  }
};

// Apply leave for child
exports.applyChildLeave = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId } = req.params;
    const { leaveType, startDate, endDate, reason, totalDays } = req.body;

    const student = await Student.findOne({ _id: studentId, schoolId, $or: [{ parentEmail: req.user.email }, { 'parent.email': req.user.email }] });
    if (!student) return res.status(403).json({ error: 'Access denied' });

    const newLeave = new LeaveRequest({
      schoolId,
      studentId,
      requesterId: req.user.userId,
      requesterType: 'parent',
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      status: 'pending'
    });

    await newLeave.save();
    res.status(201).json({ success: true, message: 'Leave applied successfully' });
  } catch (err) {
    console.error('Error applying leave:', err);
    res.status(500).json({ success: false, error: 'Failed to apply leave' });
  }
};

// Get child leave history
exports.getChildLeaveHistory = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId } = req.params;

    const student = await Student.findOne({ _id: studentId, schoolId, $or: [{ parentEmail: req.user.email }, { 'parent.email': req.user.email }] });
    if (!student) return res.status(403).json({ error: 'Access denied' });

    const leaves = await LeaveRequest.find({ studentId, schoolId }).sort({ createdAt: -1 });
    res.json({ success: true, data: leaves });
  } catch (err) {
    console.error('Error fetching leave history:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch leave history' });
  }
};

// Apply outpass for child
exports.applyChildOutpass = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId } = req.params;
    const { fromDate, toDate, reason, parentContact } = req.body;

    const student = await Student.findOne({ _id: studentId, schoolId, $or: [{ parentEmail: req.user.email }, { 'parent.email': req.user.email }] });
    if (!student) return res.status(403).json({ error: 'Access denied' });

    const allocation = await HostelAllocation.findOne({ schoolId, studentId, status: 'active' });
    if (!allocation) return res.status(400).json({ error: 'Child not in hostel' });

    const newOutpass = new HostelOutpass({
      schoolId,
      studentId,
      hostelId: allocation.hostelId,
      fromDate,
      toDate,
      reason,
      parentContact: parentContact || req.user.phone,
      status: 'pending'
    });

    await newOutpass.save();
    res.status(201).json({ success: true, message: 'Outpass requested successfully' });
  } catch (err) {
    console.error('Error applying outpass:', err);
    res.status(500).json({ success: false, error: 'Failed to apply outpass' });
  }
};


// Get child online classes
exports.getChildOnlineClasses = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId } = req.params;

    const student = await Student.findOne({ _id: studentId, schoolId, $or: [{ parentEmail: req.user.email }, { 'parent.email': req.user.email }] });
    if (!student) return res.status(403).json({ error: 'Access denied' });

    // Find the Class ID
    const studentClassDoc = await Class.findOne({
      schoolId,
      name: student.class,
      section: student.section
    });

    if (!studentClassDoc) {
      return res.json({ success: true, data: [] });
    }

    const onlineClasses = await OnlineClass.find({
      schoolId,
      classId: studentClassDoc._id
    }).populate('teacherId', 'firstName lastName')
      .sort({ scheduledDate: 1 }); // Sorted by date ascending

    res.json({ success: true, data: onlineClasses });
  } catch (err) {
    console.error('Error fetching online classes:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch online classes' });
  }
};

// Get child exam schedule
exports.getChildExamSchedule = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId } = req.params;

    const student = await Student.findOne({ _id: studentId, schoolId, $or: [{ parentEmail: req.user.email }, { 'parent.email': req.user.email }] });
    if (!student) return res.status(403).json({ error: 'Access denied' });

    // Find the Class ID
    const studentClassDoc = await Class.findOne({
      schoolId,
      name: student.class,
      section: student.section
    });

    if (!studentClassDoc) {
      return res.json({ success: true, data: [] });
    }

    const exams = await Exam.find({
      schoolId,
      classId: studentClassDoc._id,
      date: { $gte: new Date() }
    }).sort({ date: 1 });

    res.json({ success: true, data: exams });
  } catch (err) {
    console.error('Error fetching exam schedule:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch exam schedule' });
  }
};

// Get child hostel outpasses
exports.getChildHostelOutpasses = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId } = req.params;

    const outpasses = await HostelOutpass.find({ schoolId, studentId })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: outpasses });
  } catch (err) {
    console.error('Error fetching outpasses:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch outpasses' });
  }
};

// Update parent profile
exports.updateParentProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, phone } = req.body;
    // Basic splitting of name
    const parts = name ? name.trim().split(' ') : [];
    const firstName = parts.length > 0 ? parts[0] : undefined;
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : undefined;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;

    // Handle profile picture upload
    if (req.file) {
      updateData.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (err) {
    console.error('Error updating parent profile:', err);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};

// Update child profile picture
exports.updateChildProfilePicture = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId } = req.params;

    const student = await Student.findOne({
      _id: studentId,
      schoolId,
      $or: [
        { parentEmail: req.user.email },
        { 'parent.email': req.user.email }
      ]
    });

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found or access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const updateData = {
      profilePicture: `/uploads/profiles/${req.file.filename}`
    };

    const updatedStudent = await Student.findByIdAndUpdate(studentId, updateData, { new: true });

    res.json({ success: true, message: 'Child profile picture updated', data: updatedStudent });

  } catch (err) {
    console.error('Error updating child profile picture:', err);
    res.status(500).json({ success: false, error: 'Failed to update child profile picture' });
  }
};


