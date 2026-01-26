const express = require('express');
const router = express.Router();
const designationController = require('../controllers/designationController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', designationController.getAllDesignations);
router.post('/', designationController.createDesignation);
router.put('/:id', designationController.updateDesignation);
router.delete('/:id', designationController.deleteDesignation);

module.exports = router;
