// routes/teachers.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireSchoolAdmin } = require('../middleware/auth');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateIDCard } = require('../controllers/idCardController');

// Get all teachers
const getAllTeachers = async (req, res) => {
  const { schoolId } = req.user;

  try {
    const teachers = await Teacher.find({ schoolId }).sort({ firstName: 1, lastName: 1 });
    res.json(teachers);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
};

// Add teacher
const addTeacher = async (req, res) => {
  const { schoolId } = req.user;
  console.log('➕ Add Teacher Request:', { user: req.user.email, role: req.user.role, schoolId });

  if (!schoolId) {
    console.error('❌ Missing School ID for user:', req.user._id);
    return res.status(400).json({ error: 'User is not associated with a school. Cannot add teacher.' });
  }

  const {
    firstName, lastName, email, phone, qualification, subjects,
    joiningDate, address, salary
  } = req.body;

  if (!firstName || !lastName || !email || !subjects) {
    return res.status(400).json({ error: 'First name, last name, email, and subjects are required' });
  }

  // Check for existing user or teacher to prevent partial state
  const existingUser = await User.findOne({ email });
  const existingTeacher = await Teacher.findOne({ email, schoolId });

  if (existingUser || existingTeacher) {
    return res.status(409).json({ error: 'A user or teacher with this email already exists.' });
  }

  const teacherId = `TCH${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

  try {
    const newTeacher = new Teacher({
      teacherId, firstName, lastName, email, phone, qualification, subjects,
      joiningDate, address, salary, schoolId
    });

    await newTeacher.save();

    // Create user account for teacher
    // Generate random password
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let teacherPassword = '';
    for (let i = 0; i < 10; i++) {
      teacherPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    const hashedPassword = bcrypt.hashSync(teacherPassword, 10);

    await User.create({
      email,
      passwordHash: hashedPassword,
      role: 'teacher',
      firstName,
      lastName,
      schoolId,
      isActive: true
    });

    // Send credentials via email
    let emailStatus = 'skipped';
    if (email) {
      try {
        const { sendTeacherCredentials } = require('../utils/emailService');
        const emailResult = await sendTeacherCredentials(email, `${firstName} ${lastName}`, teacherId, teacherPassword);

        // If email fails, we still want to proceed but notify the frontend
        if (emailResult && emailResult.success === false) {
          emailStatus = 'failed';
        } else {
          emailStatus = 'sent';
        }
      } catch (emailError) {
        console.error('Failed to send teacher credentials email:', emailError);
        emailStatus = 'failed';
      }
    }

    // Generate ID Card
    try {
      await generateIDCard(newTeacher._id, 'Teacher', schoolId);
      console.log(`✅ ID Card generated for teacher: ${teacherId}`);
    } catch (idCardError) {
      console.error('Failed to generate ID card:', idCardError);
      // Continue execution, do not fail the request
    }

    res.status(201).json({
      message: emailStatus === 'sent'
        ? 'Teacher added successfully! Credentials sent via email.'
        : 'Teacher added. Email failed to send, please share credentials manually.',
      teacher: {
        id: newTeacher._id,
        teacherId,
        name: `${firstName} ${lastName}`,
        email
      },
      // ALWAYS Return credentials so frontend can show them in fallback dialog
      credentials: {
        email,
        password: teacherPassword,
        teacherId: teacherId
      },
      emailStatus: emailStatus
    });
  } catch (err) {
    console.error('❌ Error adding teacher:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'A teacher or user with this email already exists.' });
    }
    // Return actual error message for debugging
    res.status(500).json({ error: `Failed to add teacher: ${err.message}` });
  }
};

// Update teacher
const updateTeacher = async (req, res) => {
  const { schoolId } = req.user;
  const { id } = req.params;
  const updates = req.body;

  const allowedFields = [
    'firstName', 'lastName', 'email', 'phone', 'qualification',
    'subjects', 'joiningDate', 'address', 'salary'
  ];

  const updateData = {};
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  try {
    const teacher = await Teacher.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: updateData },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json({ message: 'Teacher updated successfully' });
  } catch (err) {
    console.error('Error updating teacher:', err);
    res.status(500).json({ error: 'Failed to update teacher' });
  }
};

// Delete teacher
const deleteTeacher = async (req, res) => {
  const { schoolId } = req.user;
  const { id } = req.params;

  try {
    const teacher = await Teacher.findOneAndDelete({ _id: id, schoolId });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    console.error('Error deleting teacher:', err);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
};

router.use(authenticateToken);

// School admin only routes
router.post('/', requireSchoolAdmin, addTeacher);
router.put('/:id', requireSchoolAdmin, updateTeacher);
router.delete('/:id', requireSchoolAdmin, deleteTeacher);

// Accessible by school admin and teachers
router.get('/', getAllTeachers);

module.exports = router;