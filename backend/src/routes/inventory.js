// routes/inventory.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const itemStoreController = require('../controllers/itemStoreController');
const itemSupplierController = require('../controllers/itemSupplierController');
const itemCategoryController = require('../controllers/itemCategoryController');
const itemIssueController = require('../controllers/itemIssueController');
const itemSaleController = require('../controllers/itemSaleController');
const itemSetController = require('../controllers/itemSetController');
const workOrderController = require('../controllers/workOrderController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Statistics & Summaries
router.get('/stats/summary', inventoryController.getInventoryStats);
router.get('/low-stock', inventoryController.getLowStockItems);

// Item Issuing (Stock Out)
router.get('/issues', itemIssueController.getIssues);
router.post('/issues', itemIssueController.createIssue);

// Item Sales
router.get('/sales', itemSaleController.getSales);
router.post('/sales', itemSaleController.createSale);

// Item Sets
router.get('/sets', itemSetController.getSets);
router.post('/sets', itemSetController.createSet);
router.put('/sets/:id', itemSetController.updateSet);
router.delete('/sets/:id', itemSetController.deleteSet);

// Work Orders
router.get('/workorders', workOrderController.getWorkOrders);
router.post('/workorders', workOrderController.createWorkOrder);
router.put('/workorders/:id', workOrderController.updateWorkOrder);
router.delete('/workorders/:id', workOrderController.deleteWorkOrder);

// Item Categories
router.get('/categories', itemCategoryController.getCategories);
router.post('/categories', itemCategoryController.createCategory);
router.put('/categories/:id', itemCategoryController.updateCategory);
router.delete('/categories/:id', itemCategoryController.deleteCategory);

// Item Stores
router.get('/stores', itemStoreController.getStores);
router.post('/stores', itemStoreController.createStore);
router.put('/stores/:id', itemStoreController.updateStore);
router.delete('/stores/:id', itemStoreController.deleteStore);

// Item Suppliers
router.get('/suppliers', itemSupplierController.getSuppliers);
router.post('/suppliers', itemSupplierController.createSupplier);
router.put('/suppliers/:id', itemSupplierController.updateSupplier);
router.delete('/suppliers/:id', itemSupplierController.deleteSupplier);

// Inventory Master
router.post('/', inventoryController.createInventoryItem);
router.get('/', inventoryController.getAllInventoryItems);
router.get('/:id', inventoryController.getInventoryItemById);
router.put('/:id', inventoryController.updateInventoryItem);
router.delete('/:id', inventoryController.deleteInventoryItem);

// Logistics & Movements
router.post('/:id/transaction', inventoryController.addTransaction);
router.post('/:id/assign', inventoryController.assignItem);
router.post('/:id/return', inventoryController.returnItem);
router.get('/category/:category', inventoryController.getItemsByCategory);

module.exports = router;
