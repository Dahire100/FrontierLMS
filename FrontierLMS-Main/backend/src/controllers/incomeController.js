// controllers/incomeController.js
const Income = require('../models/Income');

// Get all income records
exports.getAllIncome = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { category, incomeHead, startDate, dateFrom, endDate, dateTo, search } = req.query;

    const query = { schoolId };

    // Handle category/incomeHead
    const finalCategory = category || incomeHead;
    if (finalCategory && finalCategory !== 'all') query.category = finalCategory;

    // Handle dates
    const finalStart = startDate || dateFrom;
    const finalEnd = endDate || dateTo;
    if (finalStart || finalEnd) {
      query.incomeDate = {};
      if (finalStart) query.incomeDate.$gte = new Date(finalStart);
      if (finalEnd) query.incomeDate.$lte = new Date(finalEnd);
    }

    // Handle keyword search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { receivedFrom: { $regex: search, $options: 'i' } },
        { receiptNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const incomeRecords = await Income.find(query)
      .populate('addedBy', 'firstName lastName')
      .sort({ incomeDate: -1 });

    // Calculate total
    const total = incomeRecords.reduce((sum, inc) => sum + inc.amount, 0);

    res.json({
      success: true,
      data: incomeRecords,
      summary: {
        total,
        count: incomeRecords.length
      }
    });
  } catch (err) {
    console.error('Error fetching income:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch income records'
    });
  }
};

// Get income statistics / report
exports.getIncomeStats = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { incomeHead, startDate, dateFrom, endDate, dateTo } = req.query;

    const query = { schoolId };

    // Handle category/incomeHead
    if (incomeHead && incomeHead !== 'all') query.category = incomeHead;

    // Handle dates
    const finalStart = startDate || dateFrom;
    const finalEnd = endDate || dateTo;
    if (finalStart || finalEnd) {
      query.incomeDate = {};
      if (finalStart) query.incomeDate.$gte = new Date(finalStart);
      if (finalEnd) query.incomeDate.$lte = new Date(finalEnd);
    }

    const incomeRecords = await Income.find(query);

    // Category-wise breakdown for report
    const reportData = incomeRecords.reduce((acc, inc) => {
      const category = inc.category || 'Other';
      if (!acc[category]) {
        acc[category] = { head: category, count: 0, amount: 0 };
      }
      acc[category].count += 1;
      acc[category].amount += inc.amount;
      return acc;
    }, {});

    const reportArray = Object.values(reportData);

    res.json({
      success: true,
      report: reportArray,
      data: {
        total: reportArray.reduce((sum, r) => sum + r.amount, 0),
        count: reportArray.reduce((sum, r) => sum + r.count, 0)
      }
    });
  } catch (err) {
    console.error('Error fetching income stats:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};

// Create income record
exports.createIncome = async (req, res) => {
  try {
    const { schoolId, userId } = req.user;
    const { category, incomeHead, title, description, amount, incomeDate, date, receivedFrom, incomeFrom, paymentMethod, accountType, receiptNumber, invoiceNo, attachments } = req.body;

    const newIncome = new Income({
      schoolId,
      category: category || incomeHead || 'other',
      title: title || incomeHead || 'Manual Income',
      description,
      amount,
      incomeDate: incomeDate || date || new Date(),
      receivedFrom: receivedFrom || incomeFrom,
      paymentMethod: paymentMethod || accountType || 'cash',
      receiptNumber: receiptNumber || invoiceNo,
      attachments: attachments || [],
      addedBy: userId
    });

    await newIncome.save();

    res.status(201).json({
      success: true,
      message: 'Income recorded successfully',
      data: newIncome
    });
  } catch (err) {
    console.error('Error creating income:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to record income'
    });
  }
};

// Update income
exports.updateIncome = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const updates = { ...req.body };
    if (updates.incomeHead && !updates.category) updates.category = updates.incomeHead;
    if (updates.date && !updates.incomeDate) updates.incomeDate = updates.date;
    if (updates.incomeFrom && !updates.receivedFrom) updates.receivedFrom = updates.incomeFrom;
    if (updates.accountType && !updates.paymentMethod) updates.paymentMethod = updates.accountType;
    if (updates.invoiceNo && !updates.receiptNumber) updates.receiptNumber = updates.invoiceNo;

    const income = await Income.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!income) {
      return res.status(404).json({
        success: false,
        error: 'Income record not found'
      });
    }

    res.json({
      success: true,
      message: 'Income updated successfully',
      data: income
    });
  } catch (err) {
    console.error('Error updating income:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update income'
    });
  }
};

// Delete income
exports.deleteIncome = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const income = await Income.findOneAndDelete({ _id: id, schoolId });

    if (!income) {
      return res.status(404).json({
        success: false,
        error: 'Income record not found'
      });
    }

    res.json({
      success: true,
      message: 'Income deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting income:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete income'
    });
  }
};
