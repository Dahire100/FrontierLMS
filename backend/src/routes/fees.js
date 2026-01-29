const express = require('express');
const router = express.Router();
const { authenticateToken, requireSchoolAdmin } = require('../middleware/auth');
const {
  getAllFees,
  addFee,
  updateFeeStatus,
  deleteFee,
  getFeeSummaryByClass,
  getDueFees,
  collectFees,
  getDueReport
} = require('../controllers/feesController');

const {
  createFeeGroup, getFeeGroups, updateFeeGroup, deleteFeeGroup,
  createFeeType, getFeeTypes, updateFeeType, deleteFeeType,
  createFeeMaster, getFeeMasters, updateFeeMaster, deleteFeeMaster
} = require('../controllers/feeMasterController');

const {
  createFeeDiscount, getFeeDiscounts, updateFeeDiscount, deleteFeeDiscount
} = require('../controllers/feeDiscountController');

router.use(authenticateToken);

// --- Fee Groups ---
router.post('/groups', requireSchoolAdmin, createFeeGroup);
router.get('/groups', getFeeGroups);
router.put('/groups/:id', requireSchoolAdmin, updateFeeGroup);
router.delete('/groups/:id', requireSchoolAdmin, deleteFeeGroup);

// --- Fee Types ---
router.post('/types', requireSchoolAdmin, createFeeType);
router.get('/types', getFeeTypes);
router.put('/types/:id', requireSchoolAdmin, updateFeeType);
router.delete('/types/:id', requireSchoolAdmin, deleteFeeType);

// --- Fee Masters ---
router.post('/masters', requireSchoolAdmin, createFeeMaster);
router.get('/masters', getFeeMasters);
router.put('/masters/:id', requireSchoolAdmin, updateFeeMaster);
router.delete('/masters/:id', requireSchoolAdmin, deleteFeeMaster);

// --- Fee Discounts ---
router.post('/discounts', requireSchoolAdmin, createFeeDiscount);
router.get('/discounts', getFeeDiscounts);
router.put('/discounts/:id', requireSchoolAdmin, updateFeeDiscount);
router.delete('/discounts/:id', requireSchoolAdmin, deleteFeeDiscount);

// --- Student Fees (Transactions) ---
// School admin only routes
router.post('/', requireSchoolAdmin, addFee);
router.put('/:id', requireSchoolAdmin, updateFeeStatus);
router.delete('/:id', requireSchoolAdmin, deleteFee);

// Accessible by school admin and teachers
router.get('/', getAllFees);
router.get('/summary', getFeeSummaryByClass);

// --- Collection ---
router.get('/collect/:studentId', getDueFees);
router.post('/collect', collectFees);

// --- Reports ---
router.get('/due-report', getDueReport);

module.exports = router;