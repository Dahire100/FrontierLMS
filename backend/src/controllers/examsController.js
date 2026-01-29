// controllers/examsController.js
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const Student = require('../models/Student');

// Get all exams
exports.getAllExams = async (req, res) => {
  const { schoolId } = req.user;
  const { class: studentClass } = req.query;

  try {
    const query = { schoolId };
    if (studentClass) query.class = studentClass;

    const exams = await Exam.find(query).sort({ date: -1 });
    res.json(exams);
  } catch (err) {
    console.error('Error fetching exams:', err);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

// Add exam
exports.addExam = async (req, res) => {
  const { schoolId } = req.user;
  const { examName, class: studentClass, subject, examDate, totalMarks, startTime, endTime } = req.body;

  if (!examName || !studentClass || !subject || !examDate || !totalMarks) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newExam = new Exam({
      examName,
      class: studentClass,
      subject,
      date: examDate,
      startTime: startTime || '09:00', // Default if not provided
      endTime: endTime || '12:00', // Default if not provided
      totalMarks,
      schoolId
    });

    await newExam.save();

    res.status(201).json({
      message: 'Exam added successfully',
      examId: newExam._id
    });
  } catch (err) {
    console.error('Error adding exam:', err);
    res.status(500).json({ error: 'Failed to add exam' });
  }
};

// Update exam
exports.updateExam = async (req, res) => {
  const { schoolId } = req.user;
  const { id } = req.params;
  const updates = req.body;

  const allowedFields = ['examName', 'class', 'subject', 'examDate', 'totalMarks', 'startTime', 'endTime'];
  const updateData = {};

  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      // Map examDate to date for schema
      const schemaField = field === 'examDate' ? 'date' : field;
      updateData[schemaField] = updates[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: updateData },
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    res.json({ message: 'Exam updated successfully' });
  } catch (err) {
    console.error('Error updating exam:', err);
    res.status(500).json({ error: 'Failed to update exam' });
  }
};

// Delete exam
exports.deleteExam = async (req, res) => {
  const { schoolId } = req.user;
  const { id } = req.params;

  try {
    const exam = await Exam.findOneAndDelete({ _id: id, schoolId });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // Also delete associated results
    await ExamResult.deleteMany({ examId: id, schoolId });

    res.json({ message: 'Exam deleted successfully' });
  } catch (err) {
    console.error('Error deleting exam:', err);
    res.status(500).json({ error: 'Failed to delete exam' });
  }
};

// Add exam result
exports.addResult = async (req, res) => {
  const { schoolId } = req.user;
  const { examId, studentId, marksObtained, grade, remarks } = req.body;

  if (!examId || !studentId || marksObtained === undefined) {
    return res.status(400).json({ error: 'Exam ID, Student ID, and marks are required' });
  }

  try {
    // Verify exam and student belong to the same school
    const exam = await Exam.findOne({ _id: examId, schoolId });
    const student = await Student.findOne({ _id: studentId, schoolId });

    if (!exam || !student) {
      return res.status(400).json({ error: 'Invalid exam or student' });
    }

    // Check if student class matches exam class
    if (exam.class !== student.class) {
      return res.status(400).json({ error: 'Student class does not match exam class' });
    }

    // Update or insert result
    await ExamResult.findOneAndUpdate(
      { examId, studentId, schoolId },
      { marksObtained, grade, remarks },
      { upsert: true, new: true }
    );

    res.json({ message: 'Result added successfully' });
  } catch (err) {
    console.error('Error adding result:', err);
    res.status(500).json({ error: 'Failed to add result' });
  }
};

// Add bulk exam results
exports.addBulkResults = async (req, res) => {
  const { schoolId } = req.user;
  const { examId, results } = req.body;

  if (!examId || !results || !Array.isArray(results)) {
    return res.status(400).json({ error: 'Exam ID and results array are required' });
  }

  try {
    const exam = await Exam.findOne({ _id: examId, schoolId });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const bulkOps = results.map(result => ({
      updateOne: {
        filter: { examId, studentId: result.studentId, schoolId },
        update: {
          $set: {
            marksObtained: result.marksObtained,
            grade: result.grade,
            remarks: result.remarks
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await ExamResult.bulkWrite(bulkOps);
    }

    res.json({ success: true, message: `${bulkOps.length} results processed successfully` });
  } catch (err) {
    console.error('Error adding bulk results:', err);
    res.status(500).json({ error: 'Failed to add bulk results' });
  }
};

// Get exam results
exports.getExamResults = async (req, res) => {
  const { schoolId } = req.user;
  const { examId } = req.params;

  try {
    const results = await ExamResult.find({ schoolId, examId })
      .populate('studentId', 'studentId firstName lastName class section rollNumber')
      .populate('examId', 'examName subject totalMarks')
      .sort({ 'studentId.rollNumber': 1 });

    // Transform data to match expected format
    const formattedResults = results.map(r => ({
      ...r.toObject(),
      studentId: r.studentId._id, // Keep original ID field
      firstName: r.studentId.firstName,
      lastName: r.studentId.lastName,
      class: r.studentId.class,
      section: r.studentId.section,
      rollNumber: r.studentId.rollNumber,
      examName: r.examId.examName,
      subject: r.examId.subject,
      totalMarks: r.examId.totalMarks
    }));

    res.json(formattedResults);
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

// Get student results
exports.getStudentResults = async (req, res) => {
  const { schoolId } = req.user;
  const { studentId } = req.params;

  try {
    const results = await ExamResult.find({ schoolId, studentId })
      .populate('examId', 'examName subject date totalMarks')
      .sort({ 'examId.date': -1 });

    // Transform data
    const formattedResults = results.map(r => ({
      ...r.toObject(),
      examName: r.examId.examName,
      subject: r.examId.subject,
      examDate: r.examId.date,
      totalMarks: r.examId.totalMarks
    }));

    res.json(formattedResults);
  } catch (err) {
    console.error('Error fetching student results:', err);
    res.status(500).json({ error: 'Failed to fetch student results' });
  }
};

// Get exam schedule/timetable
exports.getExamSchedule = async (req, res) => {
  const { schoolId } = req.user;
  const { class: studentClass, startDate, endDate } = req.query;

  try {
    const query = { schoolId };
    if (studentClass) query.class = studentClass;

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const schedule = await Exam.find(query)
      .sort({ date: 1, startTime: 1 })
      .select('examName class subject date startTime endTime totalMarks');

    res.json(schedule);
  } catch (err) {
    console.error('Error fetching exam schedule:', err);
    res.status(500).json({ error: 'Failed to fetch exam schedule' });
  }
};

// Get grade statistics for an exam
exports.getExamStatistics = async (req, res) => {
  const { schoolId } = req.user;
  const { examId } = req.params;

  try {
    const exam = await Exam.findOne({ _id: examId, schoolId });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const results = await ExamResult.find({ examId, schoolId });

    if (results.length === 0) {
      return res.json({
        examName: exam.examName,
        totalMarks: exam.totalMarks,
        totalStudents: 0,
        submitted: 0,
        pending: 0,
        average: 0,
        highest: 0,
        lowest: 0,
        passCount: 0,
        failCount: 0,
        passPercentage: 0
      });
    }

    const marks = results.map(r => r.marksObtained);
    const average = marks.reduce((a, b) => a + b, 0) / marks.length;
    const highest = Math.max(...marks);
    const lowest = Math.min(...marks);

    const passingMarks = exam.totalMarks * 0.4; // 40% passing
    const passCount = marks.filter(m => m >= passingMarks).length;
    const failCount = marks.filter(m => m < passingMarks).length;

    res.json({
      examName: exam.examName,
      subject: exam.subject,
      class: exam.class,
      totalMarks: exam.totalMarks,
      totalStudents: results.length,
      submitted: results.length,
      average: average.toFixed(2),
      highest,
      lowest,
      passCount,
      failCount,
      passPercentage: ((passCount / results.length) * 100).toFixed(2),
      gradeDistribution: calculateGradeDistribution(results, exam.totalMarks)
    });
  } catch (err) {
    console.error('Error fetching exam statistics:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// Helper function for grade distribution
function calculateGradeDistribution(results, totalMarks) {
  const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };

  results.forEach(result => {
    const percentage = (result.marksObtained / totalMarks) * 100;
    if (percentage >= 90) distribution.A++;
    else if (percentage >= 75) distribution.B++;
    else if (percentage >= 60) distribution.C++;
    else if (percentage >= 40) distribution.D++;
    else distribution.F++;
  });

  return distribution;
}

// Get class performance report
exports.getClassPerformanceReport = async (req, res) => {
  const { schoolId } = req.user;
  const { class: studentClass, subject } = req.query;

  if (!studentClass) {
    return res.status(400).json({ error: 'Class is required' });
  }

  try {
    const query = { schoolId, class: studentClass };
    if (subject) query.subject = subject;

    const exams = await Exam.find(query);
    const examIds = exams.map(e => e._id);

    const results = await ExamResult.find({
      schoolId,
      examId: { $in: examIds }
    }).populate('examId studentId');

    // Group by exam
    const examPerformance = {};
    results.forEach(result => {
      const examId = result.examId._id.toString();
      if (!examPerformance[examId]) {
        examPerformance[examId] = {
          examName: result.examId.examName,
          subject: result.examId.subject,
          totalMarks: result.examId.totalMarks,
          marks: []
        };
      }
      examPerformance[examId].marks.push(result.marksObtained);
    });

    // Calculate statistics for each exam
    const report = Object.values(examPerformance).map(exam => {
      const avg = exam.marks.reduce((a, b) => a + b, 0) / exam.marks.length;
      return {
        examName: exam.examName,
        subject: exam.subject,
        totalMarks: exam.totalMarks,
        studentsAppeared: exam.marks.length,
        averageMarks: avg.toFixed(2),
        averagePercentage: ((avg / exam.totalMarks) * 100).toFixed(2)
      };
    });

    res.json(report);
  } catch (err) {
    console.error('Error fetching class performance:', err);
    res.status(500).json({ error: 'Failed to fetch class report' });
  }
};

// Get top performers
exports.getTopPerformers = async (req, res) => {
  const { schoolId } = req.user;
  const { examId, limit = 10 } = req.query;

  try {
    const query = { schoolId };
    if (examId) query.examId = examId;

    const results = await ExamResult.find(query)
      .populate('studentId', 'firstName lastName studentId class section')
      .populate('examId', 'examName subject totalMarks')
      .sort({ marksObtained: -1 })
      .limit(parseInt(limit));

    const topPerformers = results.map(r => ({
      studentId: r.studentId.studentId,
      studentName: `${r.studentId.firstName} ${r.studentId.lastName}`,
      class: r.studentId.class,
      section: r.studentId.section,
      examName: r.examId.examName,
      subject: r.examId.subject,
      marksObtained: r.marksObtained,
      totalMarks: r.examId.totalMarks,
      percentage: ((r.marksObtained / r.examId.totalMarks) * 100).toFixed(2),
      grade: r.grade
    }));

    res.json(topPerformers);
  } catch (err) {
    console.error('Error fetching top performers:', err);
    res.status(500).json({ error: 'Failed to fetch top performers' });
  }
};

// Get admit card data
exports.getAdmitCards = async (req, res) => {
  const { schoolId } = req.user;
  const { examName, class: studentClass, section } = req.query;

  if (!examName || !studentClass) {
    return res.status(400).json({ error: 'Exam name and class are required' });
  }

  try {
    // 1. Fetch all exam papers for this exam name and class
    const exams = await Exam.find({
      schoolId,
      examName,
      class: studentClass
    }).sort({ date: 1, startTime: 1 });

    if (exams.length === 0) {
      return res.status(404).json({ error: 'No exams found for this selection' });
    }

    // 2. Fetch students
    const studentQuery = { schoolId, class: studentClass };
    if (section) studentQuery.section = section;

    const students = await Student.find(studentQuery)
      .select('firstName lastName fatherName rollNumber studentId profilePicture class section gender dob')
      .sort({ rollNumber: 1 });

    res.json({
      examName,
      class: studentClass,
      schedule: exams.map(e => ({
        subject: e.subject,
        date: e.date,
        startTime: e.startTime,
        endTime: e.endTime,
        totalMarks: e.totalMarks
      })),
      students
    });
  } catch (err) {
    console.error('Error fetching admit cards:', err);
    res.status(500).json({ error: 'Failed to fetch admit card data' });
  }
};

// Get exam by ID
exports.getExamById = async (req, res) => {
  const { schoolId } = req.user;
  const { id } = req.params;

  try {
    const exam = await Exam.findOne({ _id: id, schoolId });

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json(exam);
  } catch (err) {
    console.error('Error fetching exam:', err);
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
};

// Update exam result
exports.updateResult = async (req, res) => {
  const { schoolId } = req.user;
  const { id } = req.params;
  const { marksObtained, grade, remarks } = req.body;

  try {
    const result = await ExamResult.findOneAndUpdate(
      { _id: id, schoolId },
      { marksObtained, grade, remarks },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.json({ message: 'Result updated successfully', result });
  } catch (err) {
    console.error('Error updating result:', err);
    res.status(500).json({ error: 'Failed to update result' });
  }
};

// Delete exam result
exports.deleteResult = async (req, res) => {
  const { schoolId } = req.user;
  const { id } = req.params;

  try {
    const result = await ExamResult.findOneAndDelete({ _id: id, schoolId });

    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.json({ message: 'Result deleted successfully' });
  } catch (err) {
    console.error('Error deleting result:', err);
    res.status(500).json({ error: 'Failed to delete result' });
  }
};
