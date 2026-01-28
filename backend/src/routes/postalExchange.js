const express = require('express');
const router = express.Router();
const postalExchangeController = require('../controllers/postalExchangeController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', postalExchangeController.getAllPostal);
router.get('/:id', postalExchangeController.getPostalById);
router.post('/', postalExchangeController.createPostal);
router.put('/:id', postalExchangeController.updatePostal);
router.delete('/:id', postalExchangeController.deletePostal);

module.exports = router;
