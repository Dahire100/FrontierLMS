// controllers/attendanceController.js
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// Mark attendance
exports.markAttendance = async (req, res) => {
  const { schoolId, _id: userId, role } = req.user;
  let { date, class: studentClass, section, attendanceRecords, classId } = req.body;

  try {
    // If classId is provided, fetch class details
    if (classId && (!studentClass || !section)) {
      const Class = require('../models/Class');
      const classDoc = await Class.findById(classId);
      if (classDoc) {
        studentClass = classDoc.name;
        section = classDoc.section;
      }
    }

    if (!date || !studentClass || !section || !attendanceRecords) {
      return res.status(400).json({ error: 'All fields (date, class, section, records) are required' });
    }

    const attendanceDate = new Date(date);
    const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

    // Check if attendance is already marked and locked
    const existingAttendance = await Attendance.findOne({
      schoolId,
      date: { $gte: startOfDay, $lte: endOfDay },
      class: studentClass,
      section: section
    });

    const isAdmin = ['super_admin', 'school_admin'].includes(role);

    if (existingAttendance && existingAttendance.locked && !isAdmin) {
      return res.status(403).json({
        error: 'Attendance is locked. Only administrator can modify it.'
      });
    }

    // Get all student IDs from the records
    const studentIds = attendanceRecords.map(r => r.studentId);

    // Delete existing attendance for these students on this date
    await Attendance.deleteMany({
      schoolId,
      date: { $gte: startOfDay, $lte: endOfDay },
      studentId: { $in: studentIds }
    });

    // Prepare bulk operations
    const bulkOps = attendanceRecords.map(record => ({
      insertOne: {
        document: {
          studentId: record.studentId,
          date: new Date(date),
          status: record.status,
          remarks: record.remarks || '',
          schoolId,
          class: studentClass,
          section,
          markedBy: userId,
          locked: true, // Lock immediately after submission
          ...(classId && { classId }) // Save classId if available
        }
      }
    }));

    if (bulkOps.length > 0) {
      await Attendance.bulkWrite(bulkOps);
    }

    res.json({ message: 'Attendance marked successfully' });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

// Get attendance by class and date
exports.getAttendanceByClass = async (req, res) => {
  const { schoolId } = req.user;
  let { class: studentClass, section, date, classId } = req.query;

  try {
    if (classId && (!studentClass || !section)) {
      const Class = require('../models/Class');
      const classDoc = await Class.findById(classId);
      if (classDoc) {
        studentClass = classDoc.name;
        section = classDoc.section;
      }
    }

    if (!studentClass || !date) {
      return res.status(400).json({ error: 'Class and date are required' });
    }

    const attendanceDate = new Date(date);
    const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

    // Get all students in the class
    const query = { schoolId, class: studentClass };
    if (section) query.section = section;
    query.isDeleted = { $ne: true }; // Only active students

    const students = await Student.find(query).sort({ rollNumber: 1, firstName: 1 });

    // Get attendance for these students on the date
    const attendanceRecords = await Attendance.find({
      schoolId,
      date: { $gte: startOfDay, $lte: endOfDay },
      studentId: { $in: students.map(s => s._id) }
    });

    // Map attendance to students
    const result = students.map(student => {
      const record = attendanceRecords.find(a => a.studentId.toString() === student._id.toString());
      return {
        _id: student._id,
        studentId: student._id,
        rollNo: student.studentId, // Using studentId as rollNo based on original code intent
        firstName: student.firstName,
        lastName: student.lastName,
        fatherName: student.fatherName,
        status: record ? record.status : null,
        remarks: record ? record.remarks : null,
        date: record ? record.date : date,
        attendanceMarked: !!record
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

// Get student attendance summary
exports.getAttendanceSummary = async (req, res) => {
  const { schoolId } = req.user;
  const { studentId, month, year } = req.query;

  if (!studentId || !month || !year) {
    return res.status(400).json({ error: 'Student ID, month, and year are required' });
  }

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const summary = await Attendance.aggregate([
      {
        $match: {
          schoolId: new mongoose.Types.ObjectId(schoolId),
          studentId: new mongoose.Types.ObjectId(studentId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } // Lowercase 'present' to match enum
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
          },
          lateDays: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
          },
          halfDays: {
            $sum: { $cond: [{ $eq: ['$status', 'half_day'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalDays: 1,
          presentDays: 1,
          absentDays: 1,
          lateDays: 1,
          halfDays: 1
        }
      }
    ]);

    res.json(summary[0] || { totalDays: 0, presentDays: 0, absentDays: 0, lateDays: 0, halfDays: 0 });
  } catch (err) {
    console.error('Error fetching attendance summary:', err);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
};

// Get monthly attendance report
exports.getMonthlyReport = async (req, res) => {
  const { schoolId } = req.user;
  let { class: studentClass, section, month, year, classId } = req.query;

  try {
    if (classId && (!studentClass || !section)) {
      const Class = require('../models/Class');
      const classDoc = await Class.findById(classId);
      if (classDoc) {
        studentClass = classDoc.name;
        section = classDoc.section;
      }
    }

    if (!studentClass || !month || !year) {
      return res.status(400).json({ error: 'Class, month, and year are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get all students in class
    const studentQuery = { schoolId, class: studentClass };
    if (section) studentQuery.section = section;
    studentQuery.isDeleted = { $ne: true };

    const students = await Student.find(studentQuery).sort({ rollNumber: 1, firstName: 1 });

    // Get attendance for the month
    const attendance = await Attendance.aggregate([
      {
        $match: {
          schoolId: new mongoose.Types.ObjectId(schoolId),
          class: studentClass,
          ...(section && { section }),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$studentId',
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
          },
          halfDays: {
            $sum: { $cond: [{ $eq: ['$status', 'half_day'] }, 1, 0] }
          }
        }
      }
    ]);

    // Merge students with attendance data
    const report = students.map(student => {
      const record = attendance.find(a => a._id.toString() === student._id.toString());
      const totalDays = record ? record.totalDays : 0;
      const presentDays = record ? record.presentDays : 0;
      const absentDays = record ? record.absentDays : 0;
      const halfDays = record ? record.halfDays : 0;

      // Calculate percentage (treating half_day as 0.5 present)
      const effectivePresent = presentDays + (halfDays * 0.5);

      return {
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        totalDays,
        presentDays,
        absentDays,
        halfDays,
        attendancePercentage: totalDays > 0 ? ((effectivePresent / totalDays) * 100).toFixed(2) : 0
      };
    });

    res.json(report);
  } catch (err) {
    console.error('Error fetching monthly report:', err);
    res.status(500).json({ error: 'Failed to fetch monthly report' });
  }
};

// Get register data (daily summary for a class in a month)
exports.getRegisterData = async (req, res) => {
  const { schoolId } = req.user;
  const { classId, month, year } = req.query;

  if (!classId || !month || !year) {
    return res.status(400).json({ error: 'Class ID, month, and year are required' });
  }

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch class to get section if needed, or just filter by class
    // Assuming attendance stores class name/section or classId?
    // Our markAttendance stores class name/section. But we added classId support if markAttendance was updated? 
    // Wait, markAttendance stores class name and section string.
    // We need to match by class name and section from the classId provided.

    const Class = require('../models/Class');
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const query = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      class: classDoc.name,
      section: classDoc.section,
      date: { $gte: startDate, $lte: endDate }
    };

    const register = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
          halfDay: { $sum: { $cond: [{ $eq: ["$status", "half_day"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedRegister = register.map(r => ({
      date: r._id,
      present: r.present,
      absent: r.absent,
      late: r.late,
      halfDay: r.halfDay
    }));

    res.json(formattedRegister);
  } catch (err) {
    console.error('Error fetching register data:', err);
    res.status(500).json({ error: 'Failed to fetch register data' });
  }
};

// Get consolidated report (class-wise summary for a month)
exports.getConsolidatedReport = async (req, res) => {
  const { schoolId } = req.user;
  const { month, year, classId } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: 'Month and year are required' });
  }

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const matchStage = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      date: { $gte: startDate, $lte: endDate }
    };

    if (classId && classId !== 'all') {
      const Class = require('../models/Class');
      const classDoc = await Class.findById(classId);
      if (classDoc) {
        matchStage.class = classDoc.name;
        matchStage.section = classDoc.section;
      }
    }

    const consolidated = await Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { class: "$class", section: "$section", date: "$date" }, // Group by class/section AND date first to count working days properly?
          // actually if we group by class/section we can count dates
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
          halfDay: { $sum: { $cond: [{ $eq: ["$status", "half_day"] }, 1, 0] } }
        }
      },
      {
        $group: {
          _id: { class: "$_id.class", section: "$_id.section" },
          workingDays: { $addToSet: "$_id.date" }, // Count unique dates
          totalPresent: { $sum: "$present" },
          totalAbsent: { $sum: "$absent" },
          totalHalfDay: { $sum: "$halfDay" }
        }
      },
      {
        $project: {
          className: { $concat: ["$_id.class", "-", "$_id.section"] },
          working: { $size: "$workingDays" },
          present: "$totalPresent",
          absent: "$totalAbsent",
          halfDay: "$totalHalfDay"
        }
      },
      { $sort: { className: 1 } }
    ]);

    res.json(consolidated);
  } catch (err) {
    console.error('Error fetching consolidated report:', err);
    res.status(500).json({ error: 'Failed to fetch consolidated report' });
  }
};