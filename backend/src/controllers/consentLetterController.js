// controllers/consentLetterController.js
const ConsentRequest = require('../models/ConsentRequest');
const Student = require('../models/Student');

// Create consent request
exports.createConsentRequest = async (req, res) => {
  const { schoolId, _id: userId } = req.user;
  const {
    title,
    description,
    eventDate,
    deadlineDate,
    targetClass,
    targetClassString,
    costPerStudent
  } = req.body;

  if (!title || !eventDate || !deadlineDate) {
    return res.status(400).json({ error: 'Title, event date, and deadline are required' });
  }

  try {
    // Get students for the target class
    const query = { schoolId };
    if (targetClass) query.class = targetClass;

    const students = await Student.find(query);
    const totalStudents = students.length;

    // Create responses array with all students
    const responses = students.map(student => ({
      studentId: student._id,
      status: 'pending',
      responseDate: null
    }));

    const consentRequest = new ConsentRequest({
      schoolId,
      teacherId: userId,
      title,
      description,
      eventDate,
      deadlineDate,
      targetClass,
      targetClassString,
      costPerStudent,
      totalStudents,
      pendingCount: totalStudents,
      approvedCount: 0,
      responses,
      status: 'active'
    });

    await consentRequest.save();
    res.status(201).json(consentRequest);
  } catch (err) {
    console.error('Error creating consent request:', err);
    res.status(500).json({ error: 'Failed to create consent request' });
  }
};

// Get all consent requests
exports.getConsentRequests = async (req, res) => {
  const { schoolId } = req.user;
  const { status, classId, page = 1, limit = 10 } = req.query;

  try {
    const query = { schoolId };
    if (status) query.status = status;
    if (classId) query.targetClass = classId;

    const consentRequests = await ConsentRequest.find(query)
      .populate('teacherId', 'firstName lastName')
      .populate('targetClass', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await ConsentRequest.countDocuments(query);

    res.json({
      consentRequests,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (err) {
    console.error('Error fetching consent requests:', err);
    res.status(500).json({ error: 'Failed to fetch consent requests' });
  }
};

// Get single consent request
exports.getConsentRequestById = async (req, res) => {
  const { schoolId } = req.user;
  const { id } = req.params;

  try {
    const consentRequest = await ConsentRequest.findOne({ _id: id, schoolId })
      .populate('teacherId', 'firstName lastName')
      .populate('targetClass', 'name')
      .populate('responses.studentId', 'firstName lastName studentId');

    if (!consentRequest) {
      return res.status(404).json({ error: 'Consent request not found' });
    }

    res.json(consentRequest);
  } catch (err) {
    console.error('Error fetching consent request:', err);
    res.status(500).json({ error: 'Failed to fetch consent request' });
  }
};

// Update consent request
exports.updateConsentRequest = async (req, res) => {
  const { schoolId } = req.user;
  const { id } = req.params;
  const updates = req.body;

  try {
    const consentRequest = await ConsentRequest.findOneAndUpdate(
      { _id: id, schoolId },
      updates,
      { new: true, runValidators: true }
    );

    if (!consentRequest) {
      return res.status(404).json({ error: 'Consent request not found' });
    }

    res.json(consentRequest);
  } catch (err) {
    console.error('Error updating consent request:', err);
    res.status(500).json({ error: 'Failed to update consent request' });
  }
};

// Delete consent request
exports.deleteConsentRequest = async (req, res) => {
  const { schoolId } = req.user;
  const { id } = req.params;

  try {
    const consentRequest = await ConsentRequest.findOneAndDelete({ _id: id, schoolId });

    if (!consentRequest) {
      return res.status(404).json({ error: 'Consent request not found' });
    }

    res.json({ message: 'Consent request deleted successfully' });
  } catch (err) {
    console.error('Error deleting consent request:', err);
    res.status(500).json({ error: 'Failed to delete consent request' });
  }
};

// Update response (for parents)
exports.updateResponse = async (req, res) => {
  const { schoolId } = req.user;
  const { id } = req.params;
  const { studentId, status, parentRemark } = req.body;

  if (!studentId || !status) {
    return res.status(400).json({ error: 'Student ID and status are required' });
  }

  try {
    const consentRequest = await ConsentRequest.findOne({ _id: id, schoolId });

    if (!consentRequest) {
      return res.status(404).json({ error: 'Consent request not found' });
    }

    // Find and update the response
    const responseIndex = consentRequest.responses.findIndex(
      r => r.studentId.toString() === studentId
    );

    if (responseIndex === -1) {
      return res.status(404).json({ error: 'Student not found in consent request' });
    }

    const oldStatus = consentRequest.responses[responseIndex].status;
    consentRequest.responses[responseIndex].status = status;
    consentRequest.responses[responseIndex].parentRemark = parentRemark;
    consentRequest.responses[responseIndex].responseDate = new Date();

    // Update counts
    if (oldStatus === 'pending') consentRequest.pendingCount--;
    else if (oldStatus === 'approved') consentRequest.approvedCount--;

    if (status === 'approved') consentRequest.approvedCount++;
    else if (status === 'pending') consentRequest.pendingCount++;

    await consentRequest.save();
    res.json(consentRequest);
  } catch (err) {
    console.error('Error updating response:', err);
    res.status(500).json({ error: 'Failed to update response' });
  }
};

// Get consent requests for a student
exports.getConsentRequestsByStudent = async (req, res) => {
  const { schoolId } = req.user;
  const { studentId } = req.params;

  try {
    const consentRequests = await ConsentRequest.find({
      schoolId,
      'responses.studentId': studentId
    })
      .populate('teacherId', 'firstName lastName')
      .populate('targetClass', 'name')
      .sort({ createdAt: -1 });

    // Filter responses to show only the relevant student
    const result = consentRequests.map(req => {
      const studentResponse = req.responses.find(
        r => r.studentId.toString() === studentId
      );
      return {
        ...req.toObject(),
        studentResponse
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching student consent requests:', err);
    res.status(500).json({ error: 'Failed to fetch consent requests' });
  }
};
