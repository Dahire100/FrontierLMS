// controllers/itemStockController.js
const ItemStock = require('../models/ItemStock');
const Inventory = require('../models/Inventory');

exports.addStock = async (req, res) => {
    try {
        const { schoolId, _id: userId } = req.user;
        const stockData = { ...req.body, schoolId, addedBy: userId };

        // Verify item exists
        const item = await Inventory.findOne({ _id: stockData.item, schoolId });
        if (!item) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        const stock = new ItemStock(stockData);
        await stock.save();

        // Update inventory quantity
        item.quantity = (item.quantity || 0) + stock.quantity;
        item.purchasePrice = stock.purchasePrice; // Update latest purchase price
        await item.save();

        res.status(201).json({ message: 'Stock added successfully', data: stock });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStocks = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const stocks = await ItemStock.find({ schoolId })
            .populate('item', 'itemName itemCode')
            .populate('store', 'storeName')
            .populate('supplier', 'supplierName') // Assuming ItemSupplier model has supplierName
            .populate('addedBy', 'firstName lastName')
            .sort({ stockDate: -1 });
        res.json(stocks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStockById = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const stock = await ItemStock.findOne({ _id: req.params.id, schoolId })
            .populate('item')
            .populate('store')
            .populate('supplier');

        if (!stock) return res.status(404).json({ error: 'Stock record not found' });
        res.json(stock);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { schoolId } = req.user;
        // Note: Updating stock might require complex logic to adjust inventory quantity if quantity changed.
        // For simplicity, we'll allow basic updates but caution on quantity changes needs to be handled in a real app logic
        // often by reversing previous impact and applying new one.
        const stock = await ItemStock.findOneAndUpdate(
            { _id: req.params.id, schoolId },
            req.body,
            { new: true }
        );
        res.json({ message: 'Stock updated', data: stock });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteStock = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const stock = await ItemStock.findOneAndDelete({ _id: req.params.id, schoolId });

        if (stock) {
            // Reverse inventory quantity
            const item = await Inventory.findOne({ _id: stock.item, schoolId });
            if (item) {
                item.quantity = Math.max(0, item.quantity - stock.quantity);
                await item.save();
            }
        }

        res.json({ message: 'Stock deleted and inventory adjusted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
