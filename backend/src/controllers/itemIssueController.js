// controllers/itemIssueController.js
const ItemIssue = require('../models/ItemIssue');
const Inventory = require('../models/Inventory');

exports.createIssue = async (req, res) => {
    try {
        const { schoolId, _id: userId } = req.user;
        const issue = new ItemIssue({
            ...req.body,
            schoolId,
            issuedBy: userId,
            issueNumber: `ISS-${Date.now()}`
        });

        // Update inventory levels
        for (const itemData of req.body.items) {
            const item = await Inventory.findOne({ _id: itemData.item, schoolId });
            if (!item || item.quantity < itemData.quantity) {
                return res.status(400).json({ error: `Insufficient stock for item: ${item?.itemName || itemData.item}` });
            }
            item.quantity -= itemData.quantity;
            item.transactions.push({
                type: 'issue',
                quantity: itemData.quantity,
                user: userId,
                notes: `Issued to ${req.body.recipientName || req.body.issueTo}`,
                balanceAfter: item.quantity
            });
            await item.save();
        }

        await issue.save();
        res.status(201).json({ message: 'Items issued successfully', data: issue });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getIssues = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const issues = await ItemIssue.find({ schoolId })
            .populate('items.item', 'itemName itemCode')
            .sort({ issueDate: -1 });
        res.json(issues);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
