const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { authenticateToken } = require('../middleware/auth');

// Apply JWT authentication to all routes
router.use(authenticateToken);

// ==================== INVOICES ====================
router.get('/invoices', superAdminController.getAllInvoices);
router.post('/invoices', superAdminController.createInvoice);
router.put('/invoices/:id', superAdminController.updateInvoice);
router.delete('/invoices/:id', superAdminController.deleteInvoice);

// ==================== SAAS PLANS ====================
router.get('/plans', superAdminController.getAllPlans);
router.post('/plans', superAdminController.createPlan);
router.put('/plans/:id', superAdminController.updatePlan);
router.delete('/plans/:id', superAdminController.deletePlan);

// ==================== PLATFORM SETTINGS ====================
router.get('/settings', superAdminController.getSettings);
router.put('/settings', superAdminController.updateSettings);

// ==================== SUPPORT TICKETS ====================
router.get('/tickets', superAdminController.getAllTickets);
router.post('/tickets', superAdminController.createTicket);
router.put('/tickets/:id', superAdminController.updateTicket);

module.exports = router;
