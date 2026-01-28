// controllers/homeworkController.js
const Homework = require('../models/Homework');
const Student = require('../models/Student');

// Get all homework
exports.getAllHomework = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { classId, status } = req.query;

    const query = { schoolId };
    if (classId) query.classId = classId;
    if (status) query.status = status;

    const homework = await Homework.find(query)
      .populate('classId', 'name section')
      .populate('assignedBy', 'firstName lastName')
      .sort({ dueDate: -1 });

    res.json({
      success: true,
      data: homework
    });
  } catch (err) {
    console.error('Error fetching homework:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch homework'
    });
  }
};

// Get homework by ID
exports.getHomeworkById = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const homework = await Homework.findOne({ _id: id, schoolId })
      .populate('classId', 'name section')
      .populate('assignedBy', 'firstName lastName email')
      .populate('submissions.studentId', 'firstName lastName rollNumber');

    if (!homework) {
      return res.status(404).json({
        success: false,
        error: 'Homework not found'
      });
    }

    res.json({
      success: true,
      data: homework
    });
  } catch (err) {
    console.error('Error fetching homework:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch homework'
    });
  }
};

// Create homework
exports.createHomework = async (req, res) => {
  try {
    const { schoolId, userId, role, email } = req.user;
    const { classId, subject, title, description, dueDate, attachments, totalMarks, assignedDate } = req.body;

    let assignedBy = userId;

    if (role === 'teacher') {
      const teacher = await require('../models/Teacher').findOne({ email });
      if (teacher) {
        assignedBy = teacher._id;
      }
    }

    const newHomework = new Homework({
      schoolId,
      classId,
      subject,
      title,
      description,
      dueDate,
      attachments: attachments || [],
      totalMarks: totalMarks || 0,
      assignedBy,
      status: 'active',
      assignedDate: assignedDate || Date.now()
    });

    await newHomework.save();

    res.status(201).json({
      success: true,
      message: 'Homework created successfully',
      data: newHomework
    });
  } catch (err) {
    console.error('Error creating homework:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create homework'
    });
  }
};

// Update homework
exports.updateHomework = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const homework = await Homework.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!homework) {
      return res.status(404).json({
        success: false,
        error: 'Homework not found'
      });
    }

    res.json({
      success: true,
      message: 'Homework updated successfully',
      data: homework
    });
  } catch (err) {
    console.error('Error updating homework:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update homework'
    });
  }
};

// Submit homework (for students)
exports.submitHomework = async (req, res) => {
  try {
    const { schoolId, userId } = req.user;
    const { id } = req.params;
    const { attachments } = req.body;

    const homework = await Homework.findOne({ _id: id, schoolId });

    if (!homework) {
      return res.status(404).json({
        success: false,
        error: 'Homework not found'
      });
    }

    // Check if already submitted
    const existingSubmission = homework.submissions.find(
      s => s.studentId.toString() === userId
    );

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        error: 'Homework already submitted'
      });
    }

    homework.submissions.push({
      studentId: userId,
      submittedAt: new Date(),
      attachments: attachments || [],
      status: 'submitted'
    });

    await homework.save();

    res.json({
      success: true,
      message: 'Homework submitted successfully'
    });
  } catch (err) {
    console.error('Error submitting homework:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to submit homework'
    });
  }
};

// Grade homework
exports.gradeHomework = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id, studentId } = req.params;
    const { marks, feedback } = req.body;

    const homework = await Homework.findOne({ _id: id, schoolId });

    if (!homework) {
      return res.status(404).json({
        success: false,
        error: 'Homework not found'
      });
    }

    const submission = homework.submissions.find(
      s => s.studentId.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    submission.marks = marks;
    submission.feedback = feedback;
    submission.status = 'graded';

    await homework.save();

    res.json({
      success: true,
      message: 'Homework graded successfully'
    });
  } catch (err) {
    console.error('Error grading homework:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to grade homework'
    });
  }
};

// Delete homework
exports.deleteHomework = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const homework = await Homework.findOneAndDelete({ _id: id, schoolId });

    if (!homework) {
      return res.status(404).json({
        success: false,
        error: 'Homework not found'
      });
    }

    res.json({
      success: true,
      message: 'Homework deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting homework:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete homework'
    });
  }
};
