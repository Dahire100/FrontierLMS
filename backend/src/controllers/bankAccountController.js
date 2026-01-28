// controllers/bankAccountController.js
const BankAccount = require('../models/BankAccount');

// Create bank account
exports.createBankAccount = async (req, res) => {
    const { schoolId } = req.user;
    const accountData = { ...req.body, schoolId };

    if (!accountData.accountName || !accountData.accountNumber || !accountData.bankName || !accountData.ifscCode) {
        return res.status(400).json({ error: 'Account name, number, bank name, and IFSC code are required' });
    }

    try {
        // Check if account number already exists
        const existingAccount = await BankAccount.findOne({
            schoolId,
            accountNumber: accountData.accountNumber
        });

        if (existingAccount) {
            return res.status(400).json({ error: 'Account number already exists' });
        }

        // If this is set as primary, unset other primary accounts
        if (accountData.isPrimary) {
            await BankAccount.updateMany(
                { schoolId, isPrimary: true },
                { $set: { isPrimary: false } }
            );
        }

        // Set opening balance as current balance
        if (accountData.openingBalance) {
            accountData.currentBalance = accountData.openingBalance;
        }

        const bankAccount = new BankAccount(accountData);
        await bankAccount.save();

        res.status(201).json({
            message: 'Bank account created successfully',
            data: bankAccount
        });
    } catch (err) {
        console.error('Error creating bank account:', err);
        res.status(500).json({ error: 'Failed to create bank account' });
    }
};

// Get all bank accounts
exports.getAllBankAccounts = async (req, res) => {
    const { schoolId } = req.user;
    const { isActive, accountType, page = 1, limit = 10 } = req.query;

    try {
        const query = { schoolId };
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (accountType) query.accountType = accountType;

        const accounts = await BankAccount.find(query)
            .sort({ isPrimary: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await BankAccount.countDocuments(query);

        res.json({
            accounts,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (err) {
        console.error('Error fetching bank accounts:', err);
        res.status(500).json({ error: 'Failed to fetch bank accounts' });
    }
};

// Get bank account by ID
exports.getBankAccountById = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const account = await BankAccount.findOne({ _id: id, schoolId });

        if (!account) {
            return res.status(404).json({ error: 'Bank account not found' });
        }

        res.json(account);
    } catch (err) {
        console.error('Error fetching bank account:', err);
        res.status(500).json({ error: 'Failed to fetch bank account' });
    }
};

// Update bank account
exports.updateBankAccount = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    try {
        // If setting as primary, unset other primary accounts
        if (updates.isPrimary === true) {
            await BankAccount.updateMany(
                { schoolId, isPrimary: true, _id: { $ne: id } },
                { $set: { isPrimary: false } }
            );
        }

        const account = await BankAccount.findOneAndUpdate(
            { _id: id, schoolId },
            updates,
            { new: true, runValidators: true }
        );

        if (!account) {
            return res.status(404).json({ error: 'Bank account not found' });
        }

        res.json({ message: 'Bank account updated successfully', data: account });
    } catch (err) {
        console.error('Error updating bank account:', err);
        res.status(500).json({ error: 'Failed to update bank account' });
    }
};

// Delete bank account
exports.deleteBankAccount = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const account = await BankAccount.findOne({ _id: id, schoolId });

        if (!account) {
            return res.status(404).json({ error: 'Bank account not found' });
        }

        // Don't allow deletion if there are transactions
        if (account.transactions && account.transactions.length > 0) {
            return res.status(400).json({
                error: 'Cannot delete account with transactions. Deactivate instead.'
            });
        }

        await BankAccount.findByIdAndDelete(id);

        res.json({ message: 'Bank account deleted successfully' });
    } catch (err) {
        console.error('Error deleting bank account:', err);
        res.status(500).json({ error: 'Failed to delete bank account' });
    }
};

// Add transaction
exports.addTransaction = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { type, amount, description, reference, date } = req.body;

    if (!type || !amount) {
        return res.status(400).json({ error: 'Transaction type and amount are required' });
    }

    try {
        const account = await BankAccount.findOne({ _id: id, schoolId });

        if (!account) {
            return res.status(404).json({ error: 'Bank account not found' });
        }

        // Calculate new balance
        let newBalance = account.currentBalance;
        if (type === 'credit') {
            newBalance += amount;
        } else if (type === 'debit') {
            newBalance -= amount;
            if (newBalance < 0) {
                return res.status(400).json({ error: 'Insufficient balance' });
            }
        }

        // Add transaction
        account.transactions.push({
            date: date || new Date(),
            type,
            amount,
            description,
            reference,
            balanceAfter: newBalance
        });

        account.currentBalance = newBalance;
        await account.save();

        res.json({
            message: 'Transaction added successfully',
            currentBalance: newBalance
        });
    } catch (err) {
        console.error('Error adding transaction:', err);
        res.status(500).json({ error: 'Failed to add transaction' });
    }
};

// Get account transactions
exports.getTransactions = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { startDate, endDate, type } = req.query;

    try {
        const account = await BankAccount.findOne({ _id: id, schoolId });

        if (!account) {
            return res.status(404).json({ error: 'Bank account not found' });
        }

        let transactions = account.transactions;

        // Filter by date range
        if (startDate && endDate) {
            transactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate >= new Date(startDate) && tDate <= new Date(endDate);
            });
        }

        // Filter by type
        if (type) {
            transactions = transactions.filter(t => t.type === type);
        }

        res.json(transactions.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

// Get account statistics
exports.getBankAccountStats = async (req, res) => {
    const { schoolId } = req.user;

    try {
        const accounts = await BankAccount.find({ schoolId, isActive: true });

        const totalBalance = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
        const totalAccounts = accounts.length;

        const stats = {
            totalAccounts,
            activeAccounts: accounts.filter(a => a.isActive).length,
            totalBalance,
            primaryAccount: accounts.find(a => a.isPrimary),
            byType: {
                savings: accounts.filter(a => a.accountType === 'savings').length,
                current: accounts.filter(a => a.accountType === 'current').length,
                fixed_deposit: accounts.filter(a => a.accountType === 'fixed_deposit').length,
                recurring_deposit: accounts.filter(a => a.accountType === 'recurring_deposit').length
            }
        };

        res.json(stats);
    } catch (err) {
        console.error('Error fetching bank stats:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

// Toggle active status
exports.toggleActiveStatus = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const account = await BankAccount.findOne({ _id: id, schoolId });

        if (!account) {
            return res.status(404).json({ error: 'Bank account not found' });
        }

        account.isActive = !account.isActive;
        await account.save();

        res.json({
            message: `Account ${account.isActive ? 'activated' : 'deactivated'} successfully`,
            isActive: account.isActive
        });
    } catch (err) {
        console.error('Error toggling status:', err);
        res.status(500).json({ error: 'Failed to toggle status' });
    }
};
