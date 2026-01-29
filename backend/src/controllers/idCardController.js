const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const IDCard = require('../models/IDCard');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const School = require('../models/School');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/id-cards');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Generate unique CRN
const generateCRN = async (userType) => {
  const prefix = userType === 'Student' ? 'S' : 'T';
  let crn;
  let exists = true;
  while (exists) {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    crn = prefix + randomNum.toString();
    const existingCard = await IDCard.findOne({ crn });
    if (!existingCard) {
      exists = false;
    }
  }
  return crn;
};

// Generate ID Card PDF
const generateIDCardPDF = (user, school, crn) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [300, 200] });
    const fileName = `${crn}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ID Card Layout
    doc.fontSize(16).text('ID CARD', 100, 20);
    doc.fontSize(12).text(`School: ${school.name}`, 20, 50);
    doc.text(`CRN: ${crn}`, 20, 70);
    doc.text(`Name: ${user.firstName} ${user.lastName}`, 20, 90);
    doc.text(`Type: ${user.constructor.modelName}`, 20, 110);
    if (user.rollNumber) doc.text(`Roll Number: ${user.rollNumber}`, 20, 130);
    if (user.employeeId) doc.text(`Employee ID: ${user.employeeId}`, 20, 130);
    doc.text(`Issued: ${new Date().toLocaleDateString()}`, 20, 150);
    doc.text(`Valid Until: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, 20, 170);

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

// Generate ID Card
exports.generateIDCard = async (userId, userType, schoolId) => {
  try {
    let user;
    if (userType === 'Student') {
      user = await Student.findById(userId).populate('schoolId');
    } else if (userType === 'Teacher') {
      user = await Teacher.findById(userId).populate('schoolId');
    } else {
      throw new Error('Invalid user type');
    }

    if (!user) throw new Error('User not found');

    const school = await School.findById(schoolId);
    if (!school) throw new Error('School not found');

    const crn = await generateCRN(userType);
    const filePath = await generateIDCardPDF(user, school, crn);
    const fileUrl = `/uploads/id-cards/${crn}.pdf`;

    const validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year validity

    const idCard = new IDCard({
      schoolId,
      userId,
      userType,
      crn,
      validUntil,
      fileUrl
    });

    await idCard.save();
    return idCard;
  } catch (error) {
    console.error('Error generating ID card:', error);
    throw error;
  }
};

// Get ID Card
exports.getIDCard = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userId: authUserId, role } = req.user;

    // Allow access if user is viewing their own card or admin
    if (authUserId !== userId && !['super-admin', 'school-admin'].includes(role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const idCard = await IDCard.findOne({ userId })
      .populate('schoolId', 'name')
      .populate('userId', 'firstName lastName rollNumber employeeId');

    if (!idCard) {
      return res.status(404).json({
        success: false,
        error: 'ID card not found'
      });
    }

    res.json({
      success: true,
      data: idCard
    });
  } catch (error) {
    console.error('Error fetching ID card:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ID card'
    });
  }
};

// Download ID Card PDF
exports.downloadIDCard = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userId: authUserId, role } = req.user;

    // Allow access if user is downloading their own card or admin
    if (authUserId !== userId && !['super-admin', 'school-admin'].includes(role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const idCard = await IDCard.findOne({ userId });

    if (!idCard) {
      return res.status(404).json({
        success: false,
        error: 'ID card not found'
      });
    }

    const filePath = path.join(__dirname, '../../uploads/id-cards', `${idCard.crn}.pdf`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'ID card file not found'
      });
    }

    res.download(filePath, `${idCard.crn}.pdf`);
  } catch (error) {
    console.error('Error downloading ID card:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download ID card'
    });
  }
};

// Regenerate ID Card (for admins)
exports.regenerateIDCard = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.user;

    if (!['super-admin', 'school-admin'].includes(role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const existingCard = await IDCard.findOne({ userId });
    if (!existingCard) {
      return res.status(404).json({
        success: false,
        error: 'ID card not found'
      });
    }

    // Delete old file
    const oldFilePath = path.join(__dirname, '../../uploads/id-cards', `${existingCard.crn}.pdf`);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }

    // Delete old record
    await IDCard.findByIdAndDelete(existingCard._id);

    // Generate new card
    const newCard = await exports.generateIDCard(userId, existingCard.userType, existingCard.schoolId);

    res.json({
      success: true,
      message: 'ID card regenerated successfully',
      data: newCard
    });
  } catch (error) {
    console.error('Error regenerating ID card:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate ID card'
    });
  }
};