const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const studentHouseController = require('../controllers/studentHouseController');

router.use(authenticateToken);

router.get('/', studentHouseController.getAllHouses);
router.post('/', studentHouseController.createHouse);
router.put('/:id', studentHouseController.updateHouse);
router.delete('/:id', studentHouseController.deleteHouse);

module.exports = router;
