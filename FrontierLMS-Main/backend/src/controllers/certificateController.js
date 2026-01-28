// controllers/certificateController.js
const Certificate = require('../models/Certificate');
const Student = require('../models/Student');

// Get all certificates
exports.getAllCertificates = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { status, certificateType, studentId } = req.query;

    const query = { schoolId };
    if (status) query.status = status;
    if (certificateType) query.certificateType = certificateType;
    if (studentId) query.studentId = studentId;

    const certificates = await Certificate.find(query)
      .populate('studentId', 'firstName lastName rollNumber classId')
      .sort({ issuedDate: -1 });

    res.json({
      success: true,
      data: certificates
    });
  } catch (err) {
    console.error('Error fetching certificates:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch certificates'
    });
  }
};

// Get certificate by ID
exports.getCertificateById = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const certificate = await Certificate.findOne({ _id: id, schoolId })
      .populate('studentId', 'firstName lastName rollNumber classId dateOfBirth parentName parentPhone');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      data: certificate
    });
  } catch (err) {
    console.error('Error fetching certificate:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch certificate'
    });
  }
};

// Create certificate
exports.createCertificate = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const {
      studentId,
      certificateType,
      title,
      description,
      issuedDate,
      validUntil,
      issuedBy,
      fileUrl
    } = req.body;

    // Verify student exists
    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Generate certificate number
    const lastCertificate = await Certificate.findOne({ schoolId })
      .sort({ createdAt: -1 });
    
    let certificateNumber;
    if (lastCertificate && lastCertificate.certificateNumber) {
      const lastNumber = parseInt(lastCertificate.certificateNumber.split('-').pop());
      certificateNumber = `CERT-${new Date().getFullYear()}-${String(lastNumber + 1).padStart(4, '0')}`;
    } else {
      certificateNumber = `CERT-${new Date().getFullYear()}-0001`;
    }

    const newCertificate = new Certificate({
      schoolId,
      studentId,
      certificateType,
      title,
      description,
      issuedDate: issuedDate || new Date(),
      validUntil,
      certificateNumber,
      issuedBy,
      fileUrl,
      status: 'active'
    });

    await newCertificate.save();

    const populatedCertificate = await Certificate.findById(newCertificate._id)
      .populate('studentId', 'firstName lastName rollNumber classId');

    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data: populatedCertificate
    });
  } catch (err) {
    console.error('Error creating certificate:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create certificate'
    });
  }
};

// Update certificate
exports.updateCertificate = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const certificate = await Certificate.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('studentId', 'firstName lastName rollNumber classId');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      message: 'Certificate updated successfully',
      data: certificate
    });
  } catch (err) {
    console.error('Error updating certificate:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update certificate'
    });
  }
};

// Delete certificate
exports.deleteCertificate = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const certificate = await Certificate.findOneAndDelete({ _id: id, schoolId });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting certificate:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete certificate'
    });
  }
};

// Verify certificate by certificate number
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({ certificateNumber })
      .populate('studentId', 'firstName lastName rollNumber classId')
      .populate('schoolId', 'name address phone email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    if (certificate.status === 'revoked') {
      return res.json({
        success: false,
        error: 'This certificate has been revoked',
        data: { status: 'revoked' }
      });
    }

    if (certificate.status === 'expired') {
      return res.json({
        success: false,
        error: 'This certificate has expired',
        data: { status: 'expired' }
      });
    }

    res.json({
      success: true,
      message: 'Certificate is valid',
      data: certificate
    });
  } catch (err) {
    console.error('Error verifying certificate:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to verify certificate'
    });
  }
};

// Revoke certificate
exports.revokeCertificate = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const certificate = await Certificate.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: { status: 'revoked' } },
      { new: true }
    );

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      data: certificate
    });
  } catch (err) {
    console.error('Error revoking certificate:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke certificate'
    });
  }
};

// Get certificate statistics
exports.getCertificateStats = async (req, res) => {
  try {
    const { schoolId } = req.user;

    const total = await Certificate.countDocuments({ schoolId });
    const active = await Certificate.countDocuments({ schoolId, status: 'active' });
    const expired = await Certificate.countDocuments({ schoolId, status: 'expired' });
    const revoked = await Certificate.countDocuments({ schoolId, status: 'revoked' });

    const byType = await Certificate.aggregate([
      { $match: { schoolId } },
      { $group: { _id: '$certificateType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        expired,
        revoked,
        byType
      }
    });
  } catch (err) {
    console.error('Error fetching certificate stats:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};

module.exports = exports;
