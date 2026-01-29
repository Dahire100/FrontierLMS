// controllers/expenseController.js
const Expense = require('../models/Expense');

// Get all expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { category, expenseHead, status, startDate, dateFrom, endDate, dateTo, search } = req.query;

    const query = { schoolId };

    // Handle category/expenseHead
    const finalCategory = category || expenseHead;
    if (finalCategory && finalCategory !== 'all') query.category = finalCategory;

    if (status && status !== 'all') query.status = status;

    // Handle dates
    const finalStart = startDate || dateFrom;
    const finalEnd = endDate || dateTo;
    if (finalStart || finalEnd) {
      query.expenseDate = {};
      if (finalStart) query.expenseDate.$gte = new Date(finalStart);
      if (finalEnd) query.expenseDate.$lte = new Date(finalEnd);
    }

    // Handle keyword search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { paidTo: { $regex: search, $options: 'i' } },
        { receiptNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const expenses = await Expense.find(query)
      .populate('addedBy', 'firstName lastName')
      .sort({ expenseDate: -1 });

    // Calculate total
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.json({
      success: true,
      data: expenses,
      summary: {
        total,
        count: expenses.length
      }
    });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch expenses'
    });
  }
};

// Get expense statistics
exports.getExpenseStats = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { year, month } = req.query;

    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(currentYear, month ? month - 1 : 0, 1);
    const endDate = month
      ? new Date(currentYear, month, 0, 23, 59, 59)
      : new Date(currentYear, 11, 31, 23, 59, 59);

    const expenses = await Expense.find({
      schoolId,
      expenseDate: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' }
    });

    // Category-wise breakdown with counts and totals
    const categoryBreakdown = expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = { amount: 0, count: 0 };
      }
      acc[exp.category].amount += exp.amount;
      acc[exp.category].count += 1;
      return acc;
    }, {});

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.json({
      success: true,
      data: {
        total,
        count: expenses.length,
        categoryBreakdown,
        period: { startDate, endDate }
      }
    });
  } catch (err) {
    console.error('Error fetching expense stats:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};

// Create expense
exports.createExpense = async (req, res) => {
  try {
    const { schoolId, userId } = req.user;
    const { category, expenseHead, title, name, description, amount, expenseDate, date, paidTo, paymentMethod, accountType, receiptNumber, invoiceNo, attachments, status } = req.body;

    const newExpense = new Expense({
      schoolId,
      category: category || expenseHead || 'other',
      title: title || name || expenseHead || 'Manual Expense',
      description,
      amount,
      expenseDate: expenseDate || date || new Date(),
      paidTo,
      paymentMethod: paymentMethod || accountType || 'cash',
      receiptNumber: receiptNumber || invoiceNo,
      attachments: attachments || [],
      addedBy: userId,
      status: status || 'paid'
    });

    await newExpense.save();

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: newExpense
    });
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to record expense'
    });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const updates = { ...req.body };
    if (updates.expenseHead && !updates.category) updates.category = updates.expenseHead;
    if (updates.date && !updates.expenseDate) updates.expenseDate = updates.date;
    if (updates.accountType && !updates.paymentMethod) updates.paymentMethod = updates.accountType;
    if (updates.invoiceNo && !updates.receiptNumber) updates.receiptNumber = updates.invoiceNo;
    if (updates.name && !updates.title) updates.title = updates.name;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update expense'
    });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: { status: 'cancelled' } },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense cancelled successfully'
    });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete expense'
    });
  }
};
