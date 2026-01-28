// controllers/itemSaleController.js
const ItemSale = require('../models/ItemSale');
const Inventory = require('../models/Inventory');

exports.createSale = async (req, res) => {
    try {
        const { schoolId, _id: userId } = req.user;
        const sale = new ItemSale({
            ...req.body,
            schoolId,
            soldBy: userId,
            saleNumber: `SAL-${Date.now()}`
        });

        // Update inventory levels and transactions
        for (const itemData of req.body.items) {
            const item = await Inventory.findOne({ _id: itemData.item, schoolId });
            if (!item || item.quantity < itemData.quantity) {
                return res.status(400).json({ error: `Insufficient stock for item: ${item?.itemName || itemData.item}` });
            }
            item.quantity -= itemData.quantity;
            item.transactions.push({
                type: 'disposed', // Using disposed or adding 'sale' to enum if I updated it
                quantity: itemData.quantity,
                user: userId,
                notes: `Sold to ${req.body.customerName}`,
                balanceAfter: item.quantity
            });
            await item.save();
        }

        await sale.save();
        res.status(201).json({ message: 'Item sale recorded successfully', data: sale });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSales = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const sales = await ItemSale.find({ schoolId })
            .populate('items.item', 'itemName itemCode')
            .sort({ saleDate: -1 });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
