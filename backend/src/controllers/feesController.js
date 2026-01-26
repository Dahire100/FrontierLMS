// controllers/feesController.js
const StudentFee = require('../models/StudentFee');
const Student = require('../models/Student');
const FeeMaster = require('../models/FeeMaster');
const FeeDiscount = require('../models/FeeDiscount');
// const Income = require('../models/Income'); // Optional: Link to Income if needed

// Get all fees for a school
exports.getAllFees = async (req, res) => {
  const { schoolId } = req.user;
  const { status, studentId } = req.query;

  try {
    const query = { schoolId };
    if (status) query.status = status;

    if (studentId) {
      // If filtering by studentId string
      const student = await Student.findOne({ studentId, schoolId });
      if (student) {
        query.studentId = student._id;
      } else {
        return res.json([]);
      }
    }

    const fees = await StudentFee.find(query)
      .populate('studentId', 'studentId firstName lastName class section')
      .sort({ dueDate: -1 });

    res.json(fees);
  } catch (err) {
    console.error('Error fetching fees:', err);
    res.status(500).json({ error: 'Failed to fetch fees' });
  }
};

// Add fee record (Manual)
exports.addFee = async (req, res) => {
  const { schoolId } = req.user;
  const { studentId, feeType, amount, dueDate } = req.body;

  if (!studentId || !feeType || !amount || !dueDate) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const newFee = new StudentFee({
      studentId,
      feeType,
      amount,
      dueDate,
      status: 'pending',
      schoolId
    });

    await newFee.save();

    res.status(201).json({
      message: 'Fee record added successfully',
      feeId: newFee._id
    });
  } catch (err) {
    console.error('Error adding fee:', err);
    res.status(500).json({ error: 'Failed to add fee record' });
  }
};

// Update fee payment status
exports.updateFeeStatus = async (req, res) => {
  const { schoolId } = req.user;
  const { id } = req.params;
  const { status, paidDate, transactionId } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const fee = await StudentFee.findOneAndUpdate(
      { _id: id, schoolId },
      {
        status,
        paidDate: paidDate || (status === 'paid' ? new Date() : undefined),
        transactionId
      },
      { new: true }
    );

    if (!fee) {
      return res.status(404).json({ error: 'Fee record not found' });
    }
    res.json({ message: 'Fee status updated successfully' });
  } catch (err) {
    console.error('Error updating fee:', err);
    res.status(500).json({ error: 'Failed to update fee' });
  }
};

// Delete fee record
exports.deleteFee = async (req, res) => {
  const { schoolId } = req.user;
  const { id } = req.params;

  try {
    const fee = await StudentFee.findOneAndDelete({ _id: id, schoolId });
    if (!fee) {
      return res.status(404).json({ error: 'Fee record not found' });
    }
    res.json({ message: 'Fee record deleted successfully' });
  } catch (err) {
    console.error('Error deleting fee:', err);
    res.status(500).json({ error: 'Failed to delete fee record' });
  }
};

// Get fee summary by class
exports.getFeeSummaryByClass = async (req, res) => {
  const { schoolId } = req.user;

  try {
    const summary = await StudentFee.aggregate([
      { $match: { schoolId: new require('mongoose').Types.ObjectId(schoolId) } },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: { class: '$student.class', section: '$student.section' },
          totalFees: { $sum: 1 },
          totalCollected: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
            }
          },
          totalPending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0]
            }
          }
        }
      },
      {
        $project: {
          class: '$_id.class',
          section: '$_id.section',
          totalFees: 1,
          totalCollected: 1,
          totalPending: 1,
          _id: 0
        }
      },
      { $sort: { class: 1, section: 1 } }
    ]);

    res.json(summary);
  } catch (err) {
    console.error('Error fetching fee summary:', err);
    res.status(500).json({ error: 'Failed to fetch fee summary' });
  }
};

// Get Due Fees for a Student (Detailed Collection View)
exports.getDueFees = async (req, res) => {
  const { schoolId } = req.user;
  const { studentId } = req.params;

  try {
    // 1. Get Student Info
    const student = await Student.findOne({ _id: studentId, schoolId }).populate('class', 'class section');
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // 2. Get Fee Masters for this Class
    const masters = await FeeMaster.find({
      schoolId,
      classId: student.class._id
    })
      .populate('feeGroupId', 'name')
      .populate('feeTypeId', 'name code')
      .lean();

    // 3. Get Existing Student Fee Records (Paid/Partial/Pending)
    const records = await StudentFee.find({
      schoolId,
      studentId: student._id
    }).lean();

    // 4. Get Discounts
    const discounts = await FeeDiscount.find({ schoolId }).lean();

    // 5. Merge Data
    const dueFees = masters.map(master => {
      // Find matching existing paid/pending records
      const typeName = master.feeTypeId?.name;
      const typeCode = master.feeTypeId?.code;

      const relatedRecords = records.filter(r => r.feeType === typeName);
      const totalPaid = relatedRecords
        .filter(r => r.status === 'paid')
        .reduce((sum, r) => sum + (r.amount || 0), 0);

      return {
        masterId: master._id,
        feeGroup: master.feeGroupId?.name,
        feeType: typeName,
        feeCode: typeCode,
        totalAmount: master.amount,
        paidAmount: totalPaid,
        balance: master.amount - totalPaid,
        dueDate: master.dueDate,
        status: (master.amount - totalPaid) <= 0 ? 'Paid' : 'Due',
        fineType: master.fineType,
        fineAmount: master.fineAmount,
        lastPaymentDate: relatedRecords.length > 0 ? relatedRecords[relatedRecords.length - 1].updatedAt : null
      };
    });

    res.json({
      student: {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        admissionNo: student.studentId,
        class: `${student.class.class} - ${student.class.section}`,
        fatherName: student.parentName,
        phone: student.phone,
        photo: student.photo
      },
      dueFees,
      discounts
    });

  } catch (err) {
    console.error('Error fetching due fees:', err);
    res.status(500).json({ error: 'Failed to fetch due fees' });
  }
};

// Collect Fees (Process Payment)
exports.collectFees = async (req, res) => {
  const { schoolId } = req.user;
  const { studentId, fees, paymentMode, remarks, paidDate } = req.body;
  // fees: [{ masterId, feeType, amount, discount, fine }]

  if (!studentId || !fees || fees.length === 0) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const createdFees = [];
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const paymentDate = paidDate || new Date();

    for (const item of fees) {
      // Create StudentFee record for this payment
      const newFee = new StudentFee({
        schoolId,
        studentId,
        feeType: item.feeType,
        amount: item.amount,
        dueDate: paymentDate,
        status: 'paid',
        transactionId,
        paymentMethod: paymentMode,
        // You might want to store 'remarks', 'fine', 'discount' if schema supports it
      });
      await newFee.save();
      createdFees.push(newFee);
    }

    res.json({
      message: 'Fees collected successfully',
      transactionId,
      count: createdFees.length
    });

  } catch (err) {
    console.error('Error collecting fees:', err);
    res.status(500).json({ error: 'Failed to process fee collection' });
  }
};

// Generate Due Report for all/filtered students
exports.getDueReport = async (req, res) => {
  const { schoolId } = req.user;
  const { classId, section, feeType } = req.query;

  try {
    // 1. Find Students matching filter
    const studentQuery = { schoolId };

    if (classId) {
      // Assuming classId is the ObjectId of the Class Model, or we might need to look it up if passed as string "1"
      // But simpler if frontend passes actual class _id.
      // If frontend passes integer '1', '2', we need to join with Class model.
      // Let's assume frontend passes a string like "1" or "2" for now based on existing UI

      // BUT, current Student model uses reference to Class model.
      // So if query is '1', we first find Class ID for name '1'.

      // NOTE: Ideally frontend should send Class ID. 
      // If the query parameter is a simple string (e.g., '1'), we try to find the class document first
      const classDoc = await require('../models/Class').findOne({ schoolId, class: classId }); // Match by class name
      if (classDoc) {
        studentQuery.class = classDoc._id;
      }
    }

    if (section) studentQuery.section = section;

    const students = await Student.find(studentQuery).populate('class', 'class section').lean();

    // 2. Fetch Fee Masters
    // We need all masters to check against everyone, or filtered by class if class is selected
    const masterQuery = { schoolId };
    // If specific class selected, only get masters for that class. 
    // If no class selected, we still need masters to match with students.
    // It's efficient to fetch ALL masters for the school and map in memory if dataset is not huge.
    const allMasters = await FeeMaster.find(masterQuery)
      .populate('feeGroupId', 'name')
      .populate('feeTypeId', 'name code')
      .lean();

    // 3. Fetch All Payments (Transactions)
    const allPayments = await StudentFee.find({ schoolId }).lean();

    // 4. Calculate Dues
    const report = [];

    for (const student of students) {
      // Get masters applicable to this student's class
      const studentMasters = allMasters.filter(m =>
        m.classId.toString() === student.class?._id.toString()
      );

      for (const master of studentMasters) {
        if (feeType && master.feeTypeId?.name !== feeType) continue;

        const typeName = master.feeTypeId?.name;

        // Get total paid by this student for this fee type
        const paid = allPayments
          .filter(p => p.studentId.toString() === student._id.toString() && p.feeType === typeName && p.status === 'paid')
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        const pending = master.amount - paid;

        if (pending > 0) {
          report.push({
            _id: `${student._id}-${master._id}`, // unique key
            studentId: {
              _id: student._id,
              studentId: student.studentId,
              firstName: student.firstName,
              lastName: student.lastName,
              class: student.class?.class,
              section: student.class?.section,
              phone: student.phone
            },
            feeType: typeName,
            amount: pending,
            totalAmount: master.amount,
            paidAmount: paid,
            dueDate: master.dueDate,
            status: 'Due'
          });
        }
      }
    }

    res.json(report);

  } catch (err) {
    console.error("Error generating due report:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
};