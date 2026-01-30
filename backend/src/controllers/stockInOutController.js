// controllers/stockInOutController.js
const StockInOut = require('../models/StockInOut');
const Inventory = require('../models/Inventory');

exports.createTransaction = async (req, res) => {
    try {
        const { schoolId, _id: userId } = req.user;
        const { item: itemId, quantity, transactionType } = req.body;

        const item = await Inventory.findOne({ _id: itemId, schoolId });
        if (!item) return res.status(404).json({ error: 'Item not found' });

        const previousStock = item.quantity || 0;
        let currentStock = previousStock;

        if (transactionType === 'in') {
            currentStock += parseInt(quantity);
        } else if (transactionType === 'out') {
            if (previousStock < quantity) return res.status(400).json({ error: 'Insufficient stock' });
            currentStock -= parseInt(quantity);
        }

        const transaction = new StockInOut({
            ...req.body,
            schoolId,
            processedBy: userId,
            previousStock,
            currentStock
        });

        await transaction.save();

        // Update Inventory quantity
        item.quantity = currentStock;
        await item.save();

        res.status(201).json({ message: 'Stock transaction recorded', data: transaction });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const transactions = await StockInOut.find({ schoolId })
            .populate('item', 'itemName itemCode')
            .populate('store', 'storeName')
            .populate('processedBy', 'firstName lastName')
            .sort({ transactionDate: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const transaction = await StockInOut.findOne({ _id: req.params.id, schoolId })
            .populate('item')
            .populate('store');
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
