// controllers/teacherController.js
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Homework = require('../models/Homework');
const Attendance = require('../models/Attendance');
const LessonPlan = require('../models/LessonPlan');
const Visitor = require('../models/Visitor');
const AdmissionEnquiry = require('../models/AdmissionEnquiry');
const StudentFee = require('../models/StudentFee');
const Exam = require('../models/Exam');
const Complaint = require('../models/Complaint');
const Event = require('../models/Event');
const Certificate = require('../models/Certificate');
const ConsentRequest = require('../models/ConsentRequest');
const PostalExchange = require('../models/PostalExchange');
const Timetable = require('../models/Timetable');
const DisciplinaryIncident = require('../models/DisciplinaryIncident');
const ExamResult = require('../models/ExamResult');
const LeaveRequest = require('../models/LeaveRequest');
const Inventory = require('../models/Inventory');
const InventoryRequisition = require('../models/InventoryRequisition');
const Notice = require('../models/Notice');
const StudyMaterial = require('../models/StudyMaterial');
const { Book, IssueRecord } = require('../models/Library');
const Quiz = require('../models/Quiz');

// Get teacher dashboard statistics
exports.getTeacherDashboard = async (req, res) => {
  try {
    const { email } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    // Get assigned classes
    const assignedClasses = await Class.find({
      $or: [
        { classTeacher: teacherId },
        { 'subjects.teacher': teacherId }
      ],
      isActive: true
    }).select('name section');

    // Count total students in assigned classes
    const classIds = assignedClasses.map(c => c._id);
    const totalStudents = await Student.countDocuments({
      class: { $in: classIds }
    });

    // Count active homework
    const activeHomework = await Homework.countDocuments({
      assignedBy: teacherId,
      status: 'active'
    });

    // Get pending homework submissions
    const homeworkList = await Homework.find({
      assignedBy: teacherId,
      status: 'active'
    });

    let pendingSubmissions = 0;
    homeworkList.forEach(hw => {
      const submittedCount = hw.submissions.filter(s => s.status === 'submitted').length;
      pendingSubmissions += (totalStudents - submittedCount);
    });

    // Get today's classes from timetable
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    res.json({
      success: true,
      data: {
        teacher: {
          id: teacher._id,
          name: `${teacher.firstName} ${teacher.lastName}`,
          employeeId: teacher.employeeId,
          department: teacher.department,
          email: teacher.email,
          phone: teacher.phone
        },
        stats: {
          totalClasses: assignedClasses.length,
          totalStudents,
          activeHomework,
          pendingSubmissions
        },
        classes: assignedClasses,
        todaySchedule: today
      }
    });
  } catch (err) {
    console.error('Error fetching teacher dashboard:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
};

// Get teacher's classes
exports.getTeacherClasses = async (req, res) => {
  try {
    const { email } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    const classes = await Class.find({
      $or: [
        { classTeacher: teacherId },
        { 'subjects.teacher': teacherId }
      ],
      isActive: true
    }).populate('classTeacher', 'firstName lastName');

    // Get student count for each class
    const classesWithData = await Promise.all(
      classes.map(async (classItem) => {
        const studentCount = await Student.countDocuments({
          class: classItem._id
        });

        // Calculate attendance percentage
        const attendanceRecords = await Attendance.find({
          classId: classItem._id,
          date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        });

        let totalPresent = 0;
        let totalRecords = 0;
        attendanceRecords.forEach(record => {
          record.students.forEach(s => {
            totalRecords++;
            if (s.status === 'present') totalPresent++;
          });
        });

        const attendancePercentage = totalRecords > 0
          ? Math.round((totalPresent / totalRecords) * 100)
          : 0;

        return {
          ...classItem.toObject(),
          studentCount,
          attendancePercentage
        };
      })
    );

    res.json({
      success: true,
      data: classesWithData
    });
  } catch (err) {
    console.error('Error fetching teacher classes:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch classes'
    });
  }
};

// Get students by class for teacher
exports.getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const { email } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    // Verify teacher has access to this class
    const classItem = await Class.findOne({
      _id: classId,
      $or: [
        { classTeacher: teacherId },
        { 'subjects.teacher': teacherId }
      ]
    });

    if (!classItem) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this class'
      });
    }

    const students = await Student.find({ class: classId })
      .select('firstName lastName rollNumber email phone dateOfBirth gender parentName parentPhone parentEmail')
      .sort({ rollNumber: 1 });

    res.json({
      success: true,
      data: {
        class: classItem,
        students
      }
    });
  } catch (err) {
    console.error('Error fetching class students:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students'
    });
  }
};

// Get teacher's homework assignments
exports.getTeacherHomework = async (req, res) => {
  try {
    const { email } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    const { status, classId } = req.query;

    const query = { assignedBy: teacherId };
    if (status) query.status = status;
    if (classId) query.classId = classId;

    const homework = await Homework.find(query)
      .populate('classId', 'name section')
      .sort({ dueDate: -1 });

    res.json({
      success: true,
      data: homework
    });
  } catch (err) {
    console.error('Error fetching teacher homework:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch homework'
    });
  }
};

// Get lesson plans
exports.getLessonPlans = async (req, res) => {
  try {
    const { email, schoolId } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    const { startDate, endDate, classId } = req.query;

    const query = { teacherId, schoolId };

    if (classId) query.classId = classId;

    if (startDate || endDate) {
      query.lessonDate = {};
      if (startDate) query.lessonDate.$gte = new Date(startDate);
      if (endDate) query.lessonDate.$lte = new Date(endDate);
    }

    const lessonPlans = await LessonPlan.find(query)
      .populate('classId', 'name section')
      .sort({ lessonDate: 1 });

    res.json({
      success: true,
      data: lessonPlans
    });
  } catch (err) {
    console.error('Error fetching lesson plans:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lesson plans'
    });
  }
};

// Create lesson plan
exports.createLessonPlan = async (req, res) => {
  try {
    const { email, schoolId } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    const { classId, subject, lessonDate, topic, objectives, activities, resources, homework, notes, duration } = req.body;

    const newLessonPlan = new LessonPlan({
      schoolId,
      teacherId,
      classId,
      subject,
      lessonDate,
      topic,
      objectives: objectives || [],
      activities,
      resources,
      homework,
      notes,
      duration: duration || 45,
      status: 'planned'
    });

    await newLessonPlan.save();

    res.status(201).json({
      success: true,
      message: 'Lesson plan created successfully',
      data: newLessonPlan
    });
  } catch (err) {
    console.error('Error creating lesson plan:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create lesson plan'
    });
  }
};

// Update lesson plan
exports.updateLessonPlan = async (req, res) => {
  try {
    const { email, schoolId } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    const { id } = req.params;

    const lessonPlan = await LessonPlan.findOneAndUpdate(
      { _id: id, teacherId, schoolId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!lessonPlan) {
      return res.status(404).json({
        success: false,
        error: 'Lesson plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Lesson plan updated successfully',
      data: lessonPlan
    });
  } catch (err) {
    console.error('Error updating lesson plan:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update lesson plan'
    });
  }
};

// Delete lesson plan
exports.deleteLessonPlan = async (req, res) => {
  try {
    const { email, schoolId } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    const { id } = req.params;

    const lessonPlan = await LessonPlan.findOneAndDelete({
      _id: id,
      teacherId,
      schoolId
    });

    if (!lessonPlan) {
      return res.status(404).json({
        success: false,
        error: 'Lesson plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Lesson plan deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting lesson plan:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete lesson plan'
    });
  }
};

// --- Front Office ---

// Get Visitors
exports.getVisitors = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const visitors = await Visitor.find({ schoolId }).sort({ date: -1 });
    res.json({ success: true, data: visitors });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch visitors' });
  }
};

// Add Visitor
// Add Visitor
exports.addVisitor = async (req, res) => {
  try {
    const { schoolId } = req.user;
    console.log('📝 Adding visitor:', req.body);

    // Remove empty date so default applies
    const visitorData = { ...req.body, schoolId };
    if (!visitorData.date) delete visitorData.date;

    const newVisitor = new Visitor(visitorData);
    await newVisitor.save();
    res.status(201).json({ success: true, message: 'Visitor added', data: newVisitor });
  } catch (err) {
    console.error('Error adding visitor:', err);
    res.status(500).json({ success: false, error: 'Failed to add visitor: ' + err.message });
  }
};

// Get Enquiries
exports.getEnquiries = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const enquiries = await AdmissionEnquiry.find({ schoolId }).sort({ date: -1 });
    res.json({ success: true, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries' });
  }
};

// --- Fees ---

// Get Class Fees
exports.getFees = async (req, res) => {
  try {
    const { email, schoolId } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

    const { classId } = req.query;
    let query = { schoolId };
    if (classId) query.classId = classId;

    const fees = await StudentFee.find(query).populate('studentId', 'firstName lastName rollNumber');
    res.json({ success: true, data: fees });
  } catch (err) {
    console.error('Error fetching fees:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch fees' });
  }
};

// Send Fee Reminder
exports.sendFeeReminder = async (req, res) => {
  try {
    const { studentId, invoiceId } = req.body;
    // Logic to send email/SMS would go here
    res.json({ success: true, message: 'Reminder sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to send reminder' });
  }
};

// --- Evaluation ---

// Get Assessments
exports.getAssessments = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const assessments = await Exam.find({ schoolId }).sort({ startDate: -1 });
    res.json({ success: true, data: assessments });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch assessments' });
  }
};

// Create Assessment
exports.createAssessment = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const newExam = new Exam({ ...req.body, schoolId });
    await newExam.save();
    res.status(201).json({ success: true, message: 'Assessment created', data: newExam });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create assessment' });
  }
};

// --- Disciplinary ---

// Get Incidents
exports.getDisciplinaryIncidents = async (req, res) => {
  try {
    const { schoolId, email } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    // Get incidents reported by the teacher or involving their students
    const incidents = await DisciplinaryIncident.find({
      schoolId,
      reportedBy: teacherId
    }).populate('studentId', 'firstName lastName rollNumber class section');

    res.json({ success: true, data: incidents });
  } catch (err) {
    console.error('Error fetching disciplinary incidents:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch incidents' });
  }
};

// Report Incident
exports.reportIncident = async (req, res) => {
  try {
    const { schoolId, email } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    const { studentId, incidentDate, location, severity, description } = req.body;

    const newIncident = new DisciplinaryIncident({
      schoolId,
      reportedBy: teacherId,
      studentId,
      incidentDate,
      location,
      severity,
      description,
      status: 'pending'
    });

    await newIncident.save();

    const populatedIncident = await DisciplinaryIncident.findById(newIncident._id)
      .populate('studentId', 'firstName lastName rollNumber class section');

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully',
      data: populatedIncident
    });
  } catch (err) {
    console.error('Error reporting disciplinary incident:', err);
    res.status(500).json({ success: false, error: 'Failed to report incident' });
  }
};

// --- Events ---

// Get Events
exports.getEvents = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const events = await Event.find({ schoolId }).sort({ startDateTime: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
};

// Propose Event
exports.proposeEvent = async (req, res) => {
  try {
    const { schoolId, email } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    // Extract and map fields
    const { title, type, eventType, date, eventDate, startTime, endTime, description, venue } = req.body;

    const newEvent = new Event({
      schoolId,
      title: title || 'Event Proposal',
      description,
      eventType: eventType || type,
      eventDate: eventDate || date,
      startTime,
      endTime,
      venue: venue || 'TBD',
      organizer: teacherId,
      status: 'pending'
    });

    await newEvent.save();
    res.status(201).json({ success: true, message: 'Event proposed', data: newEvent });
  } catch (err) {
    console.error("Propose event error:", err);
    res.status(500).json({ success: false, error: 'Failed to propose event: ' + err.message });
  }
};

// --- Certificates ---

// Get Certificates
exports.getCertificates = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const certs = await Certificate.find({ schoolId })
      .populate({
        path: 'studentId',
        select: 'firstName lastName class section'
      });
    res.json({ success: true, data: certs });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch certificates' });
  }
};

// Generate Certificate
exports.generateCertificate = async (req, res) => {
  try {
    const { schoolId, email } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

    const { studentId, type, reason, date } = req.body;

    if (!studentId || !type) {
      return res.status(400).json({ success: false, error: 'Student and Certificate Type are required' });
    }

    const newCert = new Certificate({
      schoolId,
      studentId,
      certificateType: type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Certificate`,
      description: reason || '',
      issuedDate: date || new Date(),
      certificateNumber: `CERT-${Date.now().toString().slice(-8)}`,
      issuedBy: `${teacher.firstName} ${teacher.lastName}`,
      status: 'active'
    });

    await newCert.save();

    // Populate student details for the response
    await newCert.populate('studentId', 'firstName lastName');

    res.status(201).json({ success: true, message: 'Certificate generated', data: newCert });
  } catch (err) {
    console.error("Certificate generation error:", err);
    res.status(500).json({ success: false, error: 'Failed to generate certificate' });
  }
};

// --- Consent ---

// Get Requests
exports.getConsentRequests = async (req, res) => {
  try {
    const { schoolId, email } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    const requests = await ConsentRequest.find({ schoolId, teacherId });
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch consent requests' });
  }
};

// Create Request
exports.createConsentRequest = async (req, res) => {
  try {
    const { schoolId, email } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    const newRequest = new ConsentRequest({ ...req.body, schoolId, teacherId });
    await newRequest.save();
    res.status(201).json({ success: true, message: 'Consent request created', data: newRequest });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create consent request' });
  }
};
// --- Profile ---

// Get current teacher profile
exports.getTeacherProfile = async (req, res) => {
  try {
    const { email, schoolId, firstName, lastName, role } = req.user;
    let teacher = await Teacher.findOne({ email, schoolId });

    if (!teacher) {
      // Auto-create profile if user is a teacher but has no profile
      if (role === 'teacher') {
        console.log('⚠️ Teacher profile missing for user:', email, '- Auto-creating...');

        teacher = new Teacher({
          teacherId: `TCH-${Date.now()}`,
          firstName: firstName || 'Teacher',
          lastName: lastName || 'User',
          email,
          schoolId,
          department: 'General',
          subjects: [],
          joiningDate: new Date()
        });

        await teacher.save();
        console.log('✅ Auto-created teacher profile:', teacher._id);
      } else {
        return res.status(404).json({ success: false, error: 'Teacher not found' });
      }
    }

    res.json({ success: true, data: teacher });
  } catch (err) {
    console.error('Error in getTeacherProfile:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

// Update teacher profile
exports.updateTeacherProfile = async (req, res) => {
  try {
    const { email, schoolId } = req.user;
    const updates = req.body;

    const teacher = await Teacher.findOneAndUpdate(
      { email, schoolId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }

    // Sync with User model if name fields or profile picture are updated
    if (updates.firstName || updates.lastName || updates.profilePicture) {
      try {
        const User = require('../models/User');
        const userUpdate = {};
        if (updates.firstName) userUpdate.firstName = updates.firstName;
        if (updates.lastName) userUpdate.lastName = updates.lastName;
        if (updates.profilePicture) userUpdate.profilePicture = updates.profilePicture;

        await User.findOneAndUpdate(
          { email },
          { $set: userUpdate }
        );
        console.log('✅ Synced profile changes to User model for:', email);
      } catch (syncErr) {
        console.error('⚠️ Failed to sync User model:', syncErr);
        // Continue, as the main profile update succeeded
      }
    }

    res.json({ success: true, message: 'Profile updated successfully', data: teacher });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};
// --- Timetable ---

// Get current teacher's weekly timetable
exports.getTeacherTimetable = async (req, res) => {
  try {
    const { email, schoolId } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    // Find all timetable entries that have at least one period assigned to this teacher
    const timetableEntries = await Timetable.find({
      schoolId,
      'periods.teacher': teacherId
    }).populate('classId', 'name section');

    // Group and format for easier consumption
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formattedTimetable = days.map(day => {
      const dayEntries = timetableEntries.filter(t => t.dayOfWeek === day);

      const teacherPeriods = [];
      dayEntries.forEach(entry => {
        entry.periods.forEach(p => {
          if (p.teacher && p.teacher.toString() === teacherId.toString()) {
            teacherPeriods.push({
              periodNumber: p.periodNumber,
              subject: p.subject,
              startTime: p.startTime,
              endTime: p.endTime,
              room: p.room,
              className: entry.classId.name,
              section: entry.classId.section
            });
          }
        });
      });

      // Sort periods by number
      teacherPeriods.sort((a, b) => a.periodNumber - b.periodNumber);

      return {
        day,
        periods: teacherPeriods
      };
    });

    res.json({ success: true, data: formattedTimetable });
  } catch (err) {
    console.error('Error fetching teacher timetable:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch timetable' });
  }
};
// --- Attendance ---

// Mark Attendance (Bulk)
exports.markAttendance = async (req, res) => {
  try {
    const { schoolId, _id: userId } = req.user;
    const { date, className, section, attendanceData } = req.body;

    if (!date || !className || !section || !attendanceData) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance is already marked and locked
    const existingAttendance = await Attendance.findOne({
      schoolId,
      date: attendanceDate,
      class: className,
      section: section
    });

    if (existingAttendance && existingAttendance.locked) {
      return res.status(403).json({
        success: false,
        error: 'Attendance is locked. Please contact Admin for any corrections.'
      });
    }

    const operations = attendanceData.map(item => ({
      updateOne: {
        filter: {
          studentId: item.studentId,
          date: attendanceDate,
          schoolId
        },
        update: {
          $set: {
            status: item.status,
            class: className,
            section: section,
            schoolId,
            markedBy: userId,
            locked: true // Lock immediately
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(operations);

    res.json({ success: true, message: 'Attendance recorded and locked successfully' });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ success: false, error: 'Failed to record attendance' });
  }
};

// Get Attendance for a class and date
exports.getAttendance = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { date, className, section } = req.query;

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      schoolId,
      date: attendanceDate,
      class: className,
      section: section
    });

    res.json({ success: true, data: attendance });
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch attendance' });
  }
};

// --- Exams & Marks ---

// Get Exams for teacher's classes
exports.getTeacherExams = async (req, res) => {
  try {
    const { schoolId } = req.user;

    // In a real app, we might filter by classes assigned to teacher
    // For now, getting all exams in the school
    const exams = await Exam.find({ schoolId }).sort({ date: -1 });

    res.json({ success: true, data: exams });
  } catch (err) {
    console.error('Error fetching exams:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch exams' });
  }
};

// Get Results for an exam
exports.getExamResults = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { examId } = req.params;

    const results = await ExamResult.find({
      schoolId,
      examId
    });

    res.json({ success: true, data: results });
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch results' });
  }
};

// Save Bulk Results
exports.saveBulkResults = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { examId, results } = req.body;

    if (!examId || !results || !Array.isArray(results)) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const operations = results.map(item => ({
      updateOne: {
        filter: {
          examId,
          studentId: item.studentId,
          schoolId
        },
        update: {
          $set: {
            marksObtained: item.marksObtained,
            remarks: item.remarks,
            schoolId
          }
        },
        upsert: true
      }
    }));

    await ExamResult.bulkWrite(operations);

    res.json({ success: true, message: 'Marks saved successfully' });
  } catch (err) {
    console.error('Error saving marks:', err);
    res.status(500).json({ success: false, error: 'Failed to save marks' });
  }
};

// --- Leave Management ---

// Get Teacher Leaves
exports.getTeacherLeaves = async (req, res) => {
  try {
    const { email, schoolId } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    const leaves = await LeaveRequest.find({
      schoolId,
      requesterId: teacherId,
      requesterType: 'teacher'
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: leaves });
  } catch (err) {
    console.error('Error fetching teacher leaves:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch leaves' });
  }
};

// Apply for Leave
exports.applyLeave = async (req, res) => {
  try {
    const { email, schoolId } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newLeave = new LeaveRequest({
      schoolId,
      requesterId: teacherId,
      requesterType: 'teacher',
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      status: 'pending'
    });

    await newLeave.save();

    res.json({ success: true, message: 'Leave application submitted successfully', data: newLeave });
  } catch (err) {
    console.error('Error applying for leave:', err);
    res.status(500).json({ success: false, error: 'Failed to submit leave application' });
  }
};

// Cancel Leave
exports.cancelLeave = async (req, res) => {
  try {
    const { email, schoolId } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    const { id } = req.params;

    const leave = await LeaveRequest.findOneAndUpdate(
      { _id: id, requesterId: teacherId, status: 'pending', schoolId },
      { status: 'cancelled' },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave request not found or cannot be cancelled' });
    }

    res.json({ success: true, message: 'Leave request cancelled successfully', data: leave });
  } catch (err) {
    console.error('Error cancelling leave:', err);
    res.status(500).json({ success: false, error: 'Failed to cancel leave application' });
  }
};

// --- Notice Board ---
exports.getTeacherNotices = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const notices = await Notice.find({
      schoolId,
      isActive: true,
      targetAudience: { $in: ['all', 'teachers'] }
    }).sort({ publishedDate: -1 });
    res.json({ success: true, data: notices });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch notices' });
  }
};

// --- Download Center ---
exports.getStudyMaterials = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const materials = await StudyMaterial.find({ schoolId, isActive: true })
      .populate('uploadedBy', 'firstName lastName')
      .populate('classes', 'name section') // Populate classes
      .sort({ createdAt: -1 });
    res.json({ success: true, data: materials });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch study materials' });
  }
};

exports.uploadStudyMaterial = async (req, res) => {
  try {
    const { schoolId, userId } = req.user;
    const { title, type, subject, classId, fileUrl: bodyFileUrl } = req.body;

    let fileUrl = bodyFileUrl;
    let fileSize = "Unknown";

    if (req.file) {
      fileUrl = `/uploads/study-materials/${req.file.filename}`;
      fileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
    }

    const newMaterial = new StudyMaterial({
      schoolId,
      title,
      type,
      subject,
      classes: classId ? [classId] : [], // Wrap classId in array for classes field
      fileUrl,
      fileSize,
      uploadedBy: userId
    });

    await newMaterial.save();
    res.status(201).json({ success: true, message: 'Material uploaded successfully', data: newMaterial });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: 'Failed to upload material' });
  }
};

// --- Library ---
exports.getLibraryBooks = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const books = await Book.find({ schoolId, isActive: true });
    res.json({ success: true, data: books });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch books' });
  }
};

exports.getMyIssuedBooks = async (req, res) => {
  try {
    const { email, schoolId } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

    const issuedBooks = await IssueRecord.find({
      schoolId,
      'issuedTo.userId': teacher._id,
      'issuedTo.userType': 'teacher',
      status: 'issued'
    }).populate('bookId');

    res.json({ success: true, data: issuedBooks });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch issued books' });
  }
};

// --- Online Exams ---
exports.getAvailableQuizzes = async (req, res) => {
  try {
    const { schoolId, email } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

    const quizzes = await Quiz.find({ schoolId, teacherId: teacher._id })
      .populate('teacherId', 'firstName lastName')
      .populate('classId', 'name section');
    res.json({ success: true, data: quizzes });
  } catch (err) {
    console.error('Fetch quizzes error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch quizzes' });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const { schoolId, email } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

    const newQuiz = new Quiz({
      ...req.body,
      schoolId,
      teacherId: teacher._id
    });
    await newQuiz.save();
    res.status(201).json({ success: true, message: 'Quiz created successfully', data: newQuiz });
  } catch (err) {
    console.error('Quiz creation error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to create quiz' });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedQuiz = await Quiz.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedQuiz) return res.status(404).json({ success: false, error: 'Quiz not found' });
    res.json({ success: true, message: 'Quiz updated successfully', data: updatedQuiz });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update quiz' });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuiz = await Quiz.findByIdAndDelete(id);
    if (!deletedQuiz) return res.status(404).json({ success: false, error: 'Quiz not found' });
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete quiz' });
  }
};

// --- Inventory (Placeholder as no specific Model found) ---
// --- Inventory ---
exports.getInventory = async (req, res) => {
  try {
    const { schoolId, email } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

    // Fetch items assigned to the teacher (Active Inventory)
    const inventoryItems = await Inventory.find({ schoolId, assignedTo: teacher._id }).lean();

    // Fetch requisitions made by the teacher (Requests)
    const requisitions = await InventoryRequisition.find({ schoolId, teacherId: teacher._id }).sort({ createdAt: -1 }).lean();

    // Transform requisitions to match inventory item structure for display
    const formattedRequisitions = requisitions.flatMap(req =>
      req.items.map(item => ({
        _id: req._id, // Use requisition ID
        itemName: item.itemName,
        category: item.category,
        quantity: item.quantity,
        status: req.status === 'pending' ? 'Requested' : req.status, // Map status
        issuedDate: req.createdAt,
        isRequisition: true,
        targetClassString: req.targetClassString,
        requiredDate: req.requiredDate,
        description: item.description,
        logisticsRemark: req.logisticsRemark
      }))
    );

    // Combine both: Real inventory first, then requests
    const combinedData = [...inventoryItems, ...formattedRequisitions];

    res.json({ success: true, data: combinedData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
  }
};

exports.requestInventory = async (req, res) => {
  try {
    const { schoolId, email } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

    const { category, itemName, quantity, description, requiredDate, classId } = req.body;

    const newReq = new InventoryRequisition({
      schoolId,
      teacherId: teacher._id,
      items: [{ category, itemName, quantity, description }],
      requiredDate,
      targetClass: classId || null,
      status: 'pending'
    });

    if (classId) {
      const classObj = await Class.findById(classId);
      if (classObj) newReq.targetClassString = `${classObj.class} ${classObj.section}`;
    }

    await newReq.save();
    res.status(201).json({ success: true, message: 'Requisition created', data: newReq });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create requisition' });
  }
};

// --- Class Performance Reports ---
exports.getClassPerformanceReports = async (req, res) => {
  try {
    const { email, schoolId } = req.user;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    const teacherId = teacher._id;

    // Get classes assigned to this teacher
    const teacherClasses = await Class.find({
      $or: [{ classTeacher: teacherId }, { 'subjects.teacher': teacherId }],
      schoolId
    });

    const reports = await Promise.all(teacherClasses.map(async (cls) => {
      const studentCount = await Student.countDocuments({ class: cls._id });
      // This is a simplified report
      return {
        classId: cls._id,
        className: `${cls.name}-${cls.section}`,
        totalStudents: studentCount,
        averageAttendance: "92%", // Placeholder
        overallPerformance: "Good" // Placeholder
      };
    }));

    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch performance reports' });
  }
};
