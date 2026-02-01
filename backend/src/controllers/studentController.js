// controllers/studentController.js
const Student = require('../models/Student');
const User = require('../models/User');
const StudentFee = require('../models/StudentFee');
const School = require('../models/School');
const bcrypt = require('bcryptjs');
const { generateIDCard } = require('./idCardController');

// Generate unique student ID
// Generate unique student ID
const generateStudentId = () => {
  const timestamp = Date.now().toString();
  return `S${timestamp}${Math.floor(Math.random() * 1000)}`;
};

// Get all students for a school
exports.getAllStudents = async (req, res) => {
  const { schoolId, role } = req.user;
  const { class: studentClass, section, caste } = req.query;

  try {
    const mongoose = require('mongoose');
    const query = { isDeleted: { $ne: true } };

    // Only filter by schoolId if user is not super_admin OR schoolId is provided
    if (schoolId && mongoose.Types.ObjectId.isValid(schoolId)) {
      query.schoolId = new mongoose.Types.ObjectId(schoolId);
    } else if (role !== 'super_admin') {
      // If not super_admin but no valid schoolId, we might want to return empty or error
      // For now, let's keep the filter but it will likely match nothing if schoolId is missing
      if (schoolId) query.schoolId = schoolId;
    }

    if (studentClass && studentClass !== 'all' && studentClass !== 'All') query.class = studentClass;
    if (section && section !== 'all' && section !== 'All') query.section = section;

    // Admin only caste filter
    const isAdmin = ['super_admin', 'school_admin'].includes(role);
    if (caste && caste !== 'all' && caste !== 'All' && isAdmin) {
      query.caste = caste;
    }

    const { keyword } = req.query;
    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { studentId: regex },
        { rollNumber: regex },
        { phone: regex },
        { parentPhone: regex }
      ];
    }

    console.log('🔍 Students Search Query:', JSON.stringify(query));
    const students = await Student.find(query).sort({ class: 1, rollNumber: 1 });
    console.log(`✅ Found ${students.length} students for school ${schoolId}`);
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  const { id } = req.params;
  const { schoolId } = req.user;

  try {
    const student = await Student.findOne({ _id: id, schoolId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
};

// Add new student
exports.addStudent = async (req, res) => {
  const { schoolId } = req.user;
  let {
    firstName, lastName, class: studentClass, section, rollNumber,
    dateOfBirth, gender, address, phone, email, parentName, parentPhone, parentEmail,
    bloodGroup, transportRoute, isActive
  } = req.body;

  // Handle missing lastName - default to firstName or 'Student'
  if (!lastName || lastName.trim() === '') {
    lastName = firstName || 'Student';
  }

  // Convert isActive string to boolean
  if (typeof isActive === 'string') {
    isActive = isActive === 'true';
  }

  console.log('📝 Adding student:', { firstName, lastName, studentClass, section, email, schoolId });

  // Fetch School to get the name for prefixing
  const school = await School.findById(schoolId);
  if (!school) {
    return res.status(404).json({ error: 'School not found' });
  }
  const schoolNameClean = school.schoolName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5); // First 5 alphanum chars
  const schoolNameFull = school.schoolName.replace(/[^a-zA-Z0-9]/g, '');

  const studentId = generateStudentId();
  // Use provided admissionDate or default to now
  const admissionDate = req.body.admissionDate ? new Date(req.body.admissionDate) : new Date();

  // Handle Files
  let profilePicture = null;
  let fatherPhoto = null;
  let motherPhoto = null;
  let guardianPhoto = null;
  const documents = [];

  if (req.files && req.files.length > 0) {
    req.files.forEach(file => {
      const fileUrl = `/uploads/students/${file.filename}`;
      if (file.fieldname === 'studentPhoto') {
        profilePicture = fileUrl;
      } else if (file.fieldname === 'fatherPhoto') {
        fatherPhoto = fileUrl;
      } else if (file.fieldname === 'motherPhoto') {
        motherPhoto = fileUrl;
      } else if (file.fieldname === 'guardianPhoto') {
        guardianPhoto = fileUrl;
      } else if (file.fieldname.startsWith('doc_')) {
        documents.push({
          title: file.originalname,
          url: fileUrl
        });
      }
    });
  }

  // Check if User exists with this email (but don't block - just skip user creation)
  let existingUser = null;
  if (email) {
    existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`ℹ️ User with email ${email} already exists. Student will be created without new user account.`);
    }
  }

  try {
    const newStudent = new Student({
      studentId, firstName, lastName, class: studentClass, section, rollNumber,
      admissionDate, dateOfBirth, gender, address, phone, email,
      parentName, parentPhone, parentEmail, bloodGroup, transportRoute, schoolId,
      profilePicture, fatherPhoto, motherPhoto, guardianPhoto, documents,
      isActive: isActive !== undefined ? isActive : true
    });

    await newStudent.save();
    console.log(`✅ Student saved: ${studentId} - ${firstName} ${lastName}`);

    // Only create user account if email doesn't already exist
    let studentPassword = null;
    if (email && !existingUser) {
      const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let randomPart = '';
      for (let i = 0; i < 6; i++) {
        randomPart += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      studentPassword = `${schoolNameFull}@${randomPart}`;
      const hashedPassword = bcrypt.hashSync(studentPassword, 10);

      await User.create({
        email,
        username: studentId,
        passwordHash: hashedPassword,
        role: 'student',
        firstName,
        lastName,
        schoolId,
        isActive: true
      });

      // Send credentials via email using generic service
      try {
        const { sendEmail } = require('../utils/emailService');
        await sendEmail({
          to: email,
          subject: 'Your Student Credentials - Frontier LMS',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0d6efd;">Welcome to ${school.schoolName || 'Frontier LMS'}</h2>
                <p>Hello ${firstName},</p>
                <p>Your student account has been created. Here are your login details:</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #0d6efd;">
                    <p><strong>Student ID / Username:</strong> ${studentId}</p>
                    <p><strong>Password:</strong> ${studentPassword}</p>
                </div>
                <p><a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background-color: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Login Now</a></p>
            </div>
          `
        });
        console.log(`Student credentials email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send student credentials email:', emailError);
      }
    }

    // Check if Parent Email exists and Create Parent User if needed
    let parentEmailAddr = req.body.parentEmail;
    let parentPassword = null;

    if (parentEmailAddr) {
      const existingParent = await User.findOne({ email: parentEmailAddr });

      if (!existingParent) {
        const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let randomPart = '';
        for (let i = 0; i < 6; i++) {
          randomPart += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        parentPassword = `${schoolNameFull}@${randomPart}`;
        const hashedParentPassword = bcrypt.hashSync(parentPassword, 10);

        // Generate Parent ID (Starts with P)
        const parentUsername = `P${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

        await User.create({
          email: parentEmailAddr,
          username: parentUsername,
          passwordHash: hashedParentPassword,
          role: 'parent',
          firstName: parentName ? parentName.split(' ')[0] : 'Parent',
          lastName: parentName ? (parentName.split(' ').slice(1).join(' ') || 'User') : 'User',
          schoolId,
          isActive: true,
          phone: parentPhone
        });

        console.log(`✅ Parent User Created: ${parentEmailAddr}`);
        try {
          const { sendEmail } = require('../utils/emailService');
          await sendEmail({
            to: parentEmailAddr,
            subject: 'Parent Portal Access - Frontier LMS',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #198754;">Welcome to ${school.schoolName || 'Frontier LMS'} Parent Portal</h2>
                  <p>Hello ${parentName || 'Parent'},</p>
                  <p>Your parent account is ready. You can track your child's progress here:</p>
                  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #198754;">
                      <p><strong>Username:</strong> ${parentUsername}</p>
                      <p><strong>Password:</strong> ${parentPassword}</p>
                  </div>
                  <p><a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background-color: #198754; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Login to Parent Portal</a></p>
              </div>
            `
          });
          console.log(`Parent credentials email sent to ${parentEmailAddr}`);
        } catch (pErr) {
          console.error('Parent email failed', pErr);
        }
      } else {
        console.log(`ℹ️ Parent User already exists: ${parentEmailAddr}`);
      }
    }

    // Generate ID Card
    try {
      await generateIDCard(newStudent._id, 'Student', schoolId);
      console.log(`✅ ID Card generated for student: ${studentId}`);
    } catch (idCardError) {
      console.error('Failed to generate ID card:', idCardError);
      // Continue execution, do not fail the request
    }

    // Prepare response credentials
    const responseCredentials = {
      student: {
        email,
        password: studentPassword
      }
    };

    // Add parent credentials if created
    if (parentEmailAddr && parentPassword) {
      responseCredentials.parent = {
        email: parentEmailAddr,
        password: parentPassword
      };
    }

    res.status(201).json({
      message: 'Student added successfully! Credentials sent via email.',
      student: {
        id: newStudent._id,
        studentId,
        name: `${firstName} ${lastName}`,
        class: studentClass,
        section
      },
      // IN DEV ONLY: Return password for testing if email fails
      tempCredentials: responseCredentials
    });
  } catch (err) {
    console.error('Error adding student:', err);
    res.status(500).json({ error: 'Failed to add student' });
  }
};

// Import students
exports.importStudents = async (req, res) => {
  const { schoolId } = req.user;
  const students = req.body.students; // Expecting array of student objects

  if (!students || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'Invalid data format. Expected array of students.' });
  }

  // Fetch School to get the name for prefixing
  const school = await School.findById(schoolId);
  if (!school) {
    return res.status(404).json({ error: 'School not found' });
  }
  const schoolNameClean = school.schoolName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5);
  const schoolNameFull = school.schoolName.replace(/[^a-zA-Z0-9]/g, '');

  const results = {
    total: students.length,
    success: 0,
    failed: 0,
    errors: [],
    importedData: []
  };

  try {
    for (const [index, studentData] of students.entries()) {
      try {
        const {
          firstName, lastName, class: studentClass, section,
          dateOfBirth, gender, address, phone, email, parentName, parentPhone,
          bloodGroup
        } = studentData;

        // Basic validation
        if (!firstName || !studentClass || !section) {
          throw new Error(`Missing required fields for student at row ${index + 1}`);
        }

        const studentId = `${schoolNameClean}STU${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
        const admissionDate = new Date();

        // Create Student
        const newStudent = new Student({
          studentId, firstName, lastName, class: studentClass, section,
          admissionDate, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender, address, phone, email,
          parentName, parentPhone, bloodGroup, schoolId
        });

        await newStudent.save();

        // Create User for Student
        const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let randomPart = '';
        for (let i = 0; i < 6; i++) randomPart += charset.charAt(Math.floor(Math.random() * charset.length));
        const studentPassword = `${schoolNameFull}@${randomPart}`;

        const hashedPassword = bcrypt.hashSync(studentPassword, 10);
        let studentCreds = null;

        if (email) {
          // Check if user exists
          const existingUser = await User.findOne({ email });
          if (!existingUser) {
            await User.create({
              email,
              passwordHash: hashedPassword,
              role: 'student',
              firstName,
              lastName,
              schoolId,
              isActive: true
            });
            studentCreds = { email, password: studentPassword };
          }
        }

        // Handle Parent User
        let parentCreds = null;
        if (studentData.parentEmail) {
          const parentEmail = studentData.parentEmail;
          const existingParent = await User.findOne({ email: parentEmail });

          if (!existingParent) {
            let randomPart = '';
            for (let i = 0; i < 6; i++) randomPart += charset.charAt(Math.floor(Math.random() * charset.length));
            const parentPassword = `${schoolNameFull}@${randomPart}`;
            const hashedParentPassword = bcrypt.hashSync(parentPassword, 10);

            await User.create({
              email: parentEmail,
              passwordHash: hashedParentPassword,
              role: 'parent',
              firstName: parentName ? parentName.split(' ')[0] : 'Parent',
              lastName: parentName ? (parentName.split(' ').slice(1).join(' ') || 'User') : 'User',
              schoolId,
              isActive: true,
              phone: parentPhone
            });

            parentCreds = { email: parentEmail, password: parentPassword };
          } else {
            parentCreds = { email: parentEmail, password: "(Already Exists)" };
          }
        }

        results.success++;
        results.importedData.push({
          name: `${firstName} ${lastName}`,
          studentId: newStudent.studentId,
          studentCreds,
          parentName: parentName || 'N/A',
          parentCreds
        });
      } catch (err) {
        results.failed++;
        results.errors.push({ row: index + 1, error: err.message });
      }
    }

    res.json({ message: 'Import completed', results });

  } catch (err) {
    console.error('Error importing students:', err);
    res.status(500).json({ error: 'Failed to process import' });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const { schoolId } = req.user;
  const updates = req.body;

  const allowedFields = [
    'firstName', 'lastName', 'class', 'section', 'rollNumber', 'dateOfBirth',
    'gender', 'address', 'phone', 'email', 'parentName', 'parentPhone',
    'bloodGroup', 'transportRoute', 'isActive'
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
    const student = await Student.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: updateData },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ error: 'Failed to update student' });
  }
};

// Soft Delete student
exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  const { schoolId } = req.user;

  try {
    const student = await Student.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

// Bulk Delete students
exports.bulkDeleteStudents = async (req, res) => {
  const { ids } = req.body;
  const { schoolId } = req.user;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Invalid IDs provided' });
  }

  try {
    const result = await Student.updateMany(
      { _id: { $in: ids }, schoolId },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    res.json({ message: `${result.modifiedCount} students deleted successfully` });
  } catch (err) {
    console.error('Error bulk deleting students:', err);
    res.status(500).json({ error: 'Failed to delete students' });
  }
};

// Readmit student
exports.readmitStudent = async (req, res) => {
  const { id } = req.params;
  const { schoolId } = req.user;

  try {
    const student = await Student.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: { isDeleted: false, deletedAt: null } },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student re-admitted successfully' });
  } catch (err) {
    console.error('Error re-admitting student:', err);
    res.status(500).json({ error: 'Failed to re-admit student' });
  }
};

// Get Deleted Students
exports.getDeletedStudents = async (req, res) => {
  const { schoolId } = req.user;
  try {
    const students = await Student.find({ schoolId, isDeleted: true }).sort({ deletedAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deleted students' });
  }
};

// Get student fees
exports.getStudentFees = async (req, res) => {
  const { id } = req.params;
  const { schoolId } = req.user;

  try {
    // Verify student belongs to school
    const student = await Student.findOne({ _id: id, schoolId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const fees = await StudentFee.find({ studentId: id, schoolId }).sort({ dueDate: -1 });
    res.json(fees);
  } catch (err) {
    console.error('Error fetching fees:', err);
    res.status(500).json({ error: 'Failed to fetch fee details' });
  }
};

// Get student transport details
exports.getStudentTransport = async (req, res) => {
  const { id } = req.params;
  const { schoolId } = req.user;

  try {
    const student = await Student.findOne({ _id: id, schoolId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Assuming TransportRoute model exists or just returning route name
    // For now, returning basic info as per schema
    res.json({ transportRoute: student.transportRoute });
  } catch (err) {
    console.error('Error fetching transport:', err);
    res.status(500).json({ error: 'Failed to fetch transport details' });
  }
};

// Get student attendance
exports.getStudentAttendance = async (req, res) => {
  const { id } = req.params;
  const { month, year } = req.query;
  const { schoolId } = req.user;

  try {
    // Placeholder for Attendance model
    // const query = { studentId: id, schoolId };
    // if (month && year) {
    //   // Date filtering logic
    // }
    // const attendance = await Attendance.find(query).sort({ date: -1 }).limit(30);

    res.json([]); // Returning empty array until Attendance model is implemented
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

// Promote students based on resultStatus
exports.promoteStudents = async (req, res) => {
  const { schoolId } = req.user;
  const { studentIds, nextClass, manualOverride } = req.body;

  if (!studentIds || !Array.isArray(studentIds)) {
    return res.status(400).json({ error: 'Student IDs array is required' });
  }

  try {
    const students = await Student.find({ _id: { $in: studentIds }, schoolId });

    const promotionResults = {
      promoted: 0,
      retained: 0,
      skipped: 0
    };

    const bulkOps = [];

    students.forEach(student => {
      // Manual override skipping result check
      if (manualOverride) {
        bulkOps.push({
          updateOne: {
            filter: { _id: student._id },
            update: {
              $set: {
                class: nextClass || student.class,
                isPromoted: true,
                resultStatus: 'PASS' // Implicitly set to PASS on manual promote
              }
            }
          }
        });
        promotionResults.promoted++;
      } else {
        if (student.resultStatus === 'PASS') {
          bulkOps.push({
            updateOne: {
              filter: { _id: student._id },
              update: {
                $set: {
                  class: nextClass || (parseInt(student.class) + 1).toString(),
                  isPromoted: true
                }
              }
            }
          });
          promotionResults.promoted++;
        } else if (student.resultStatus === 'FAIL') {
          // Keep in same class, but mark as processed
          bulkOps.push({
            updateOne: {
              filter: { _id: student._id },
              update: { $set: { isPromoted: false } }
            }
          });
          promotionResults.retained++;
        } else {
          promotionResults.skipped++;
        }
      }
    });

    if (bulkOps.length > 0) {
      await Student.bulkWrite(bulkOps);
    }

    res.json({
      message: 'Promotion process completed',
      results: promotionResults
    });
  } catch (err) {
    console.error('Error promoting students:', err);
    res.status(500).json({ error: 'Failed to promote students' });
  }
};

// Get pending verification documents (Admin)
exports.getPendingDocuments = async (req, res) => {
  const { schoolId } = req.user;
  try {
    const StudentDocument = require('../models/StudentDocument');
    const docs = await StudentDocument.find({ schoolId, status: 'pending' })
      .populate('studentId', 'firstName lastName class section rollNumber')
      .sort({ uploadedAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error('Error fetching pending documents:', err);
    res.status(500).json({ error: 'Failed to fetch pending documents' });
  }
};

// Verify/Reject Document (Admin)
exports.verifyDocument = async (req, res) => {
  const { schoolId, _id: adminId } = req.user;
  const { id } = req.params;
  const { status, note } = req.body; // status: 'verified' | 'rejected'

  if (!['verified', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const StudentDocument = require('../models/StudentDocument');
    const doc = await StudentDocument.findOneAndUpdate(
      { _id: id, schoolId },
      {
        $set: {
          status,
          verifiedBy: adminId,
          verifiedAt: new Date(),
          verificationNote: note
        }
      },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ message: `Document ${status} successfully`, data: doc });
  } catch (err) {
    console.error('Error verifying document:', err);
    res.status(500).json({ error: 'Failed to verify document' });
  }
};