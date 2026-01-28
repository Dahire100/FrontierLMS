const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Apply middleware to all routes
router.use(verifyToken);
router.use(verifyRole(['school_admin', 'super_admin']));

// Plans
router.get('/plans', subscriptionController.getPlans);
router.post('/plans', subscriptionController.createPlan);
router.put('/plans/:id', subscriptionController.updatePlan);
router.delete('/plans/:id', subscriptionController.deletePlan);

// Installment Report (Placeholder for now, could be a separate controller method or aggregated data)
// router.get('/installments', subscriptionController.getInstallmentReport);

module.exports = router;
