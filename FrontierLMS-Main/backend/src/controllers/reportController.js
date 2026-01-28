// controllers/reportController.js
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const StudentFee = require('../models/StudentFee');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Class = require('../models/Class');
const User = require('../models/User');
const Log = require('../models/Log');
const LoginHistory = require('../models/LoginHistory');
const LessonPlan = require('../models/LessonPlan');
const DocumentMaster = require('../models/DocumentMaster');

// Get generic dashboard summary (Admin Report)
exports.getDashboardSummary = async (req, res) => {
    const { schoolId } = req.user;

    try {
        const [
            totalStudents,
            totalTeachers,
            totalClasses,
            totalFeesCollected,
            totalOtherIncome,
            totalExpenses
        ] = await Promise.all([
            Student.countDocuments({ schoolId }),
            User.countDocuments({ schoolId, role: 'teacher' }),
            Class.countDocuments({ schoolId }),
            StudentFee.aggregate([
                { $match: { schoolId: new mongoose.Types.ObjectId(schoolId), status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Income.aggregate([
                { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Expense.aggregate([
                { $match: { schoolId } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        res.json({
            students: totalStudents,
            teachers: totalTeachers,
            classes: totalClasses,
            income: (totalFeesCollected[0]?.total || 0) + (totalOtherIncome[0]?.total || 0),
            expenses: totalExpenses[0]?.total || 0,
            netProfit: ((totalFeesCollected[0]?.total || 0) + (totalOtherIncome[0]?.total || 0)) - (totalExpenses[0]?.total || 0)
        });
    } catch (err) {
        console.error('Error fetching dashboard summary:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
};

// Get Student Attendance Report
exports.getAttendanceReport = async (req, res) => {
    const { schoolId } = req.user;
    const { classId, date, month, year } = req.query;

    try {
        const query = { schoolId };
        if (classId) query.class = classId;

        // Determine date range
        if (date) {
            query.date = new Date(date);
        } else if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const attendanceRecords = await Attendance.find(query)
            .populate('student', 'firstName lastName rollNumber')
            .populate('class', 'name section');

        // Aggregate stats
        const stats = {
            totalPresent: attendanceRecords.filter(r => r.status === 'Present').length,
            totalAbsent: attendanceRecords.filter(r => r.status === 'Absent').length,
            totalLate: attendanceRecords.filter(r => r.status === 'Late').length,
            attendancePercentage: 0
        };

        if (attendanceRecords.length > 0) {
            stats.attendancePercentage = ((stats.totalPresent / attendanceRecords.length) * 100).toFixed(2);
        }

        res.json({
            stats,
            records: attendanceRecords
        });
    } catch (err) {
        console.error('Error fetching attendance report:', err);
        res.status(500).json({ error: 'Failed to fetch attendance report' });
    }
};

// Get Financial Report (Income vs Expense)
exports.getFinancialReport = async (req, res) => {
    const { schoolId } = req.user;
    const { startDate, endDate } = req.query;

    try {
        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.$gte = new Date(startDate);
            dateFilter.$lte = new Date(endDate);
        } else {
            // Default to current year
            const currentYear = new Date().getFullYear();
            dateFilter.$gte = new Date(currentYear, 0, 1);
            dateFilter.$lte = new Date(currentYear, 11, 31);
        }

        const [income, expenses] = await Promise.all([
            Invoice.aggregate([
                {
                    $match: {
                        schoolId,
                        status: 'paid',
                        updatedAt: dateFilter
                    }
                },
                {
                    $group: {
                        _id: { $month: "$updatedAt" },
                        total: { $sum: '$amount' }
                    }
                }
            ]),
            Expense.aggregate([
                {
                    $match: {
                        schoolId,
                        date: dateFilter
                    }
                },
                {
                    $group: {
                        _id: { $month: "$date" },
                        total: { $sum: '$amount' }
                    }
                }
            ])
        ]);

        // Format data for charts (12 months)
        const monthlyData = Array(12).fill(0).map((_, i) => ({
            month: i + 1,
            income: 0,
            expense: 0
        }));

        income.forEach(item => {
            monthlyData[item._id - 1].income = item.total;
        });

        expenses.forEach(item => {
            monthlyData[item._id - 1].expense = item.total;
        });

        res.json({
            summary: monthlyData,
            totalIncome: income.reduce((sum, i) => sum + i.total, 0),
            totalExpense: expenses.reduce((sum, e) => sum + e.total, 0)
        });
    } catch (err) {
        console.error('Error fetching financial report:', err);
        res.status(500).json({ error: 'Failed to fetch financial report' });
    }
};

// Get Class Strength Report
exports.getClassStrengthReport = async (req, res) => {
    const { schoolId } = req.user;

    try {
        const classes = await Class.find({ schoolId }).sort({ name: 1, section: 1 });

        const report = await Promise.all(classes.map(async (cls) => {
            const count = await Student.countDocuments({ schoolId, class: cls._id });
            const boys = await Student.countDocuments({ schoolId, class: cls._id, gender: 'male' });
            const girls = await Student.countDocuments({ schoolId, class: cls._id, gender: 'female' });

            return {
                className: cls.name,
                section: cls.section,
                total: count,
                boys,
                girls,
                capacity: cls.capacity,
                occupancy: cls.capacity ? ((count / cls.capacity) * 100).toFixed(1) : 0
            };
        }));

        res.json(report);
    } catch (err) {
        console.error('Error fetching class strength report:', err);
        res.status(500).json({ error: 'Failed to fetch class strength report' });
    }
};

// Transaction Report (Detailed list of transactions)
exports.getTransactionReport = async (req, res) => {
    const { schoolId } = req.user;
    const { startDate, endDate, type } = req.query; // type: income, expense, all

    try {
        let transactions = [];
        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.$gte = new Date(startDate);
            dateFilter.$lte = new Date(endDate);
        }

        if (type === 'income' || !type || type === 'all') {
            // 1. Fetch Student Fees (Paid)
            const feeQuery = { schoolId, status: 'paid' };
            if (startDate) feeQuery.updatedAt = dateFilter;

            const feeIncomes = await StudentFee.find(feeQuery)
                .populate('studentId', 'firstName lastName')
                .select('amount updatedAt studentId feeType')
                .lean();

            transactions.push(...feeIncomes.map(i => ({
                id: i._id,
                date: i.updatedAt,
                description: `Fee - ${i.feeType}`,
                party: i.studentId ? `${i.studentId.firstName} ${i.studentId.lastName}` : 'Unknown Student',
                amount: i.amount,
                type: 'Income',
                method: 'Standard' // or fetch from transaction if available
            })));

            // 2. Fetch Other Incomes
            const incomeQuery = { schoolId };
            if (startDate) incomeQuery.incomeDate = dateFilter;

            const otherIncomes = await Income.find(incomeQuery).lean();

            transactions.push(...otherIncomes.map(i => ({
                id: i._id,
                date: i.incomeDate,
                description: i.title,
                party: i.receivedFrom || '-',
                amount: i.amount,
                type: 'Income',
                method: i.paymentMethod
            })));
        }

        if (type === 'expense' || !type || type === 'all') {
            const query = { schoolId };
            if (startDate) query.date = dateFilter;

            const expenses = await Expense.find(query).lean();

            transactions.push(...expenses.map(e => ({
                id: e._id,
                date: e.date,
                description: e.name,
                party: e.invoiceNumber || '-',
                amount: e.amount,
                type: 'Expense',
                method: e.paymentMode
            })));
        }

        // Sort by date desc
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(transactions);
    } catch (err) {
        console.error('Error fetching transaction report:', err);
        res.status(500).json({ error: 'Failed to fetch transaction report' });
    }
};

// Activity Log
exports.getActivityLog = async (req, res) => {
    const { schoolId } = req.user;
    const { page = 1, limit = 20 } = req.query;

    try {
        const logs = await Log.find({ schoolId })
            .populate('user', 'firstName lastName role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Log.countDocuments({ schoolId });

        res.json({
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch activity log' });
    }
};

// Document Availability Report
exports.getDocumentAvailability = async (req, res) => {
    const { schoolId } = req.user;
    const { classId } = req.query;

    try {
        const query = { schoolId };
        if (classId) query.class = classId;

        const students = await Student.find(query)
            .populate('class', 'name section')
            .populate('documents.documentId'); // Assuming student schema references documents

        // Simple summary: Count how many docs each student has vs total required
        const summary = students.map(student => ({
            studentId: student._id,
            name: `${student.firstName} ${student.lastName}`,
            admissionNo: student.admissionNo,
            class: `${student.class?.name}-${student.class?.section}`,
            documentsCount: student.documents ? student.documents.length : 0,
            status: (student.documents && student.documents.length > 0) ? 'Submitted' : 'Pending'
        }));

        res.json(summary);
    } catch (err) {
        console.error("Doc report error", err);
        res.status(500).json({ error: 'Failed to fetch document report' });
    }
};

// Lesson Planner Report
exports.getLessonPlannerReport = async (req, res) => {
    const { schoolId } = req.user;
    const { teacherId, startDate, endDate } = req.query;

    try {
        const query = { schoolId };
        if (teacherId) query.teacherId = teacherId;
        if (startDate) {
            query.lessonDate = { $gte: new Date(startDate), $lte: new Date(endDate || new Date()) };
        }

        const plans = await LessonPlan.find(query)
            .populate('teacherId', 'firstName lastName')
            .populate('classId', 'name section')
            .sort({ lessonDate: -1 });

        // Aggregate by status
        const stats = {
            total: plans.length,
            completed: plans.filter(p => p.status === 'completed').length,
            planned: plans.filter(p => p.status === 'planned').length
        };

        res.json({ stats, plans });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch lesson planner report' });
    }
};

// App Login Status
exports.getAppLoginStatus = async (req, res) => {
    const { schoolId } = req.user;
    const { page = 1, limit = 20 } = req.query;

    try {
        const history = await LoginHistory.find({ schoolId })
            .populate('user', 'firstName lastName email role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await LoginHistory.countDocuments({ schoolId });

        res.json({
            history,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch login status' });
    }
};
