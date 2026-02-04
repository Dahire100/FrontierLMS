// controllers/walletController.js
const Wallet = require('../models/Wallet');
const Student = require('../models/Student');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Generate unique transaction ID
const generateTxId = () => {
    return 'TXN' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Get wallet details
exports.getWallet = async (req, res) => {
    const { schoolId, _id: userId, role, email } = req.user;
    const { studentId } = req.query;

    try {
        let targetStudentId = null;

        if (role === 'admin' || role === 'school_admin' || role === 'accountant' || role === 'teacher') {
            if (!studentId) {
                return res.status(400).json({ error: 'Student ID required' });
            }
            targetStudentId = studentId;
        } else if (role === 'student') {
            const student = await Student.findOne({ email, schoolId });
            if (!student) return res.status(404).json({ error: 'Student profile not found' });
            targetStudentId = student._id;
        } else {
            return res.status(403).json({ error: 'Access denied' });
        }

        let wallet = await Wallet.findOne({ studentId: targetStudentId, schoolId });

        if (!wallet) {
            // Auto-create wallet if it doesn't exist
            const student = await Student.findById(targetStudentId);
            if (!student) {
                return res.status(404).json({ error: 'Student not found' });
            }

            wallet = new Wallet({
                schoolId,
                studentId: targetStudentId
            });
            await wallet.save();
        }

        res.json({
            balance: wallet.balance,
            status: wallet.status,
            lastUpdated: wallet.updatedAt
        });
    } catch (err) {
        console.error('Error fetching wallet:', err);
        res.status(500).json({ error: 'Failed to fetch wallet' });
    }
};

// Get wallet transactions
exports.getTransactions = async (req, res) => {
    const { schoolId, _id: userId, role, email } = req.user;
    const { studentId, page = 1, limit = 10, type, startDate, endDate } = req.query;

    try {
        // Case 1: Fetch for specific student (Existing Logic)
        if (studentId) {
            let targetStudentId = studentId;
            if (role === 'student') {
                const student = await Student.findOne({ email, schoolId });
                if (!student) return res.status(404).json({ error: 'Student profile not found' });
                // Enforce student can only see their own
                if (student._id.toString() !== studentId) {
                    return res.status(403).json({ error: 'Access denied' });
                }
                targetStudentId = student._id;
            }

            const wallet = await Wallet.findOne({ studentId: targetStudentId, schoolId });
            if (!wallet) {
                // If checking specific student and wallet missing, return empty
                return res.json({ transactions: [], total: 0, totalPages: 0, currentPage: 1 });
            }

            let transactions = wallet.transactions;

            // Apply Filters
            if (type) transactions = transactions.filter(t => t.type === type);
            if (startDate) transactions = transactions.filter(t => new Date(t.date) >= new Date(startDate));
            if (endDate) transactions = transactions.filter(t => new Date(t.date) <= new Date(endDate));

            // Sort
            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedTxns = transactions.slice(startIndex, endIndex);

            return res.json({
                transactions: paginatedTxns,
                total: transactions.length,
                totalPages: Math.ceil(transactions.length / limit),
                currentPage: parseInt(page)
            });
        }

        // Case 2: Fetch ALL transactions (Admin Only)
        if (role === 'admin' || role === 'school_admin' || role === 'accountant') {
            const pipeline = [
                { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
                { $unwind: "$transactions" },
                { $sort: { "transactions.date": -1 } }
            ];

            // Apply Filters in Aggregation
            if (type) {
                pipeline.push({ $match: { "transactions.type": type } });
            }
            if (startDate || endDate) {
                const dateFilter = {};
                if (startDate) dateFilter.$gte = new Date(startDate);
                if (endDate) dateFilter.$lte = new Date(endDate);
                pipeline.push({ $match: { "transactions.date": dateFilter } });
            }

            // Facet for pagination and counting
            pipeline.push({
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [{ $skip: (page - 1) * parseInt(limit) }, { $limit: parseInt(limit) }]
                }
            });

            const result = await Wallet.aggregate(pipeline);
            const data = result[0].data.map(item => item.transactions);
            const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;

            return res.json({
                transactions: data,
                total: total,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            });
        }

        return res.status(400).json({ error: 'Student ID required for non-admins' });

    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

// Add money (Recharge)
exports.addMoney = async (req, res) => {
    const { schoolId, _id: userId, role, email } = req.user;
    const { studentId: reqStudentId, amount, description, referenceId } = req.body;

    try {
        let targetStudentId = reqStudentId;

        // If student is recharging, ensure they only recharge their own wallet
        // For simulation/demo purposes, we allow students to call this.
        if (role === 'student') {
            const student = await Student.findOne({ email, schoolId });
            if (!student) return res.status(404).json({ error: 'Student profile not found' });
            targetStudentId = student._id.toString();
        } else if (role !== 'admin' && role !== 'school_admin' && role !== 'accountant') {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        let wallet = await Wallet.findOne({ studentId: targetStudentId, schoolId });

        if (!wallet) {
            wallet = new Wallet({ schoolId, studentId: targetStudentId });
        }

        if (wallet.status !== 'active') {
            return res.status(400).json({ error: 'Wallet is blocked or closed' });
        }

        const newBalance = wallet.balance + Number(amount);

        wallet.transactions.push({
            txId: generateTxId(),
            type: 'credit',
            category: 'recharge',
            amount: Number(amount),
            description: description || (role === 'student' ? 'Online Top-up' : 'Wallet Recharge'),
            referenceId,
            balanceAfter: newBalance,
            performedBy: userId
        });

        wallet.balance = newBalance;
        await wallet.save();

        res.json({
            message: 'Money added successfully',
            newBalance: wallet.balance
        });
    } catch (err) {
        console.error('Error adding money:', err);
        res.status(500).json({ error: 'Failed to add money' });
    }
};

// Deduct money (Debit)
exports.deductMoney = async (req, res) => {
    const { schoolId, _id: userId, role } = req.user;
    const { studentId, amount, category, description, referenceId } = req.body;

    if (role !== 'admin' && role !== 'school_admin' && role !== 'accountant' && role !== 'canteen' && role !== 'librarian') {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const wallet = await Wallet.findOne({ studentId, schoolId });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        if (wallet.status !== 'active') {
            return res.status(400).json({ error: 'Wallet is blocked' });
        }

        if (wallet.balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        const newBalance = wallet.balance - Number(amount);

        wallet.transactions.push({
            txId: generateTxId(),
            type: 'debit',
            category: category || 'other',
            amount: Number(amount),
            description: description || 'Debit transaction',
            referenceId,
            balanceAfter: newBalance,
            performedBy: userId
        });

        wallet.balance = newBalance;
        await wallet.save();

        res.json({
            message: 'Money deducted successfully',
            newBalance: wallet.balance
        });
    } catch (err) {
        console.error('Error deducting money:', err);
        res.status(500).json({ error: 'Failed to deduct money' });
    }
};

// Set Wallet Status
exports.setWalletStatus = async (req, res) => {
    const { schoolId, role } = req.user;
    const { studentId, status } = req.body;

    if (role !== 'admin' && role !== 'school_admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const wallet = await Wallet.findOneAndUpdate(
            { studentId, schoolId },
            { status },
            { new: true }
        );

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        res.json({ message: `Wallet status updated to ${status}` });
    } catch (err) {
        console.error('Error updating wallet status:', err);
        res.status(500).json({ error: 'Failed to update wallet status' });
    }
};
