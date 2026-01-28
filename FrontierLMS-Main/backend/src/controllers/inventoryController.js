// controllers/inventoryController.js
const Inventory = require('../models/Inventory');

// Create inventory item
exports.createInventoryItem = async (req, res) => {
    const { schoolId } = req.user;
    const itemData = { ...req.body, schoolId };

    if (!itemData.itemName || !itemData.itemCode || !itemData.category) {
        return res.status(400).json({ error: 'Item name, code, and category are required' });
    }

    try {
        // Check if item code already exists
        const existingItem = await Inventory.findOne({
            schoolId,
            itemCode: itemData.itemCode
        });

        if (existingItem) {
            return res.status(400).json({ error: 'Item code already exists' });
        }

        const inventoryItem = new Inventory(itemData);
        await inventoryItem.save();

        res.status(201).json({
            message: 'Inventory item created successfully',
            data: inventoryItem
        });
    } catch (err) {
        console.error('Error creating inventory item:', err);
        res.status(500).json({ error: 'Failed to create inventory item' });
    }
};

// Get all inventory items
exports.getAllInventoryItems = async (req, res) => {
    const { schoolId } = req.user;
    const { category, status, isActive, search, page = 1, limit = 10 } = req.query;

    try {
        const query = { schoolId };
        if (category) query.category = category;
        if (status) query.status = status;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        if (search) {
            query.$or = [
                { itemName: { $regex: search, $options: 'i' } },
                { itemCode: { $regex: search, $options: 'i' } }
            ];
        }

        const items = await Inventory.find(query)
            .populate('assignedTo', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Inventory.countDocuments(query);

        res.json({
            items,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (err) {
        console.error('Error fetching inventory items:', err);
        res.status(500).json({ error: 'Failed to fetch inventory items' });
    }
};

// Get inventory item by ID
exports.getInventoryItemById = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const item = await Inventory.findOne({ _id: id, schoolId })
            .populate('assignedTo', 'firstName lastName email')
            .populate('transactions.user', 'firstName lastName');

        if (!item) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        res.json(item);
    } catch (err) {
        console.error('Error fetching inventory item:', err);
        res.status(500).json({ error: 'Failed to fetch inventory item' });
    }
};

// Update inventory item
exports.updateInventoryItem = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    try {
        const item = await Inventory.findOneAndUpdate(
            { _id: id, schoolId },
            updates,
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        res.json({ message: 'Inventory item updated successfully', data: item });
    } catch (err) {
        console.error('Error updating inventory item:', err);
        res.status(500).json({ error: 'Failed to update inventory item' });
    }
};

// Delete inventory item
exports.deleteInventoryItem = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const item = await Inventory.findOneAndDelete({ _id: id, schoolId });

        if (!item) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        res.json({ message: 'Inventory item deleted successfully' });
    } catch (err) {
        console.error('Error deleting inventory item:', err);
        res.status(500).json({ error: 'Failed to delete inventory item' });
    }
};

// Add transaction (purchase, issue, return, etc.)
exports.addTransaction = async (req, res) => {
    const { schoolId, _id: userId } = req.user;
    const { id } = req.params;
    const { type, quantity, notes, date } = req.body;

    if (!type || !quantity) {
        return res.status(400).json({ error: 'Transaction type and quantity are required' });
    }

    try {
        const item = await Inventory.findOne({ _id: id, schoolId });

        if (!item) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        let newQuantity = item.quantity;

        // Update quantity based on transaction type
        if (type === 'purchase') {
            newQuantity += quantity;
        } else if (type === 'issue' || type === 'damaged' || type === 'disposed') {
            newQuantity -= quantity;
            if (newQuantity < 0) {
                return res.status(400).json({ error: 'Insufficient quantity' });
            }
        } else if (type === 'return') {
            newQuantity += quantity;
        }

        // Add transaction
        item.transactions.push({
            date: date || new Date(),
            type,
            quantity,
            user: userId,
            notes,
            balanceAfter: newQuantity
        });

        item.quantity = newQuantity;
        await item.save();

        res.json({
            message: 'Transaction added successfully',
            currentQuantity: newQuantity
        });
    } catch (err) {
        console.error('Error adding transaction:', err);
        res.status(500).json({ error: 'Failed to add transaction' });
    }
};

// Assign item to user
exports.assignItem = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { assignedTo, quantity } = req.body;

    if (!assignedTo) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const item = await Inventory.findOne({ _id: id, schoolId });

        if (!item) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        if (quantity && item.quantity < quantity) {
            return res.status(400).json({ error: 'Insufficient quantity' });
        }

        item.assignedTo = assignedTo;
        item.assignedDate = new Date();
        item.status = 'in-use';

        if (quantity) {
            item.quantity -= quantity;
            item.transactions.push({
                type: 'issue',
                quantity,
                user: assignedTo,
                notes: 'Item assigned',
                balanceAfter: item.quantity
            });
        }

        await item.save();

        res.json({ message: 'Item assigned successfully', data: item });
    } catch (err) {
        console.error('Error assigning item:', err);
        res.status(500).json({ error: 'Failed to assign item' });
    }
};

// Return item
exports.returnItem = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { quantity, condition } = req.body;

    try {
        const item = await Inventory.findOne({ _id: id, schoolId });

        if (!item) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        item.status = 'available';
        item.assignedTo = null;
        item.assignedDate = null;

        if (condition) {
            item.condition = condition;
        }

        if (quantity) {
            item.quantity += quantity;
            item.transactions.push({
                type: 'return',
                quantity,
                notes: 'Item returned',
                balanceAfter: item.quantity
            });
        }

        await item.save();

        res.json({ message: 'Item returned successfully', data: item });
    } catch (err) {
        console.error('Error returning item:', err);
        res.status(500).json({ error: 'Failed to return item' });
    }
};

// Get low stock items
exports.getLowStockItems = async (req, res) => {
    const { schoolId } = req.user;

    try {
        const items = await Inventory.find({
            schoolId,
            isActive: true,
            $expr: { $lte: ['$quantity', '$minimumStock'] }
        }).sort({ quantity: 1 });

        res.json(items);
    } catch (err) {
        console.error('Error fetching low stock items:', err);
        res.status(500).json({ error: 'Failed to fetch low stock items' });
    }
};

// Get inventory statistics
exports.getInventoryStats = async (req, res) => {
    const { schoolId } = req.user;

    try {
        const items = await Inventory.find({ schoolId, isActive: true });

        const totalValue = items.reduce((sum, item) =>
            sum + (item.quantity * (item.purchasePrice || 0)), 0
        );

        const stats = {
            totalItems: items.length,
            totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
            totalValue,
            lowStockItems: items.filter(item => item.quantity <= item.minimumStock).length,
            byCategory: {},
            byStatus: {}
        };

        // Count by category
        items.forEach(item => {
            stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
            stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
        });

        res.json(stats);
    } catch (err) {
        console.error('Error fetching inventory stats:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

// Get items by category
exports.getItemsByCategory = async (req, res) => {
    const { schoolId } = req.user;
    const { category } = req.params;

    try {
        const items = await Inventory.find({
            schoolId,
            category,
            isActive: true
        }).sort({ itemName: 1 });

        res.json(items);
    } catch (err) {
        console.error('Error fetching items by category:', err);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
};
