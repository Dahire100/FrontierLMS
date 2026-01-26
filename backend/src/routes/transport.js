// routes/transport.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireSchoolAdmin } = require('../middleware/auth');
const {
  getTransportRoutes,
  addTransportRoute,
  updateTransportRoute,
  deleteTransportRoute,
  getStudentsByRoute
} = require('../controllers/transportController');
const { getVehicles, addVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { getDrivers, addDriver, deleteDriver } = require('../controllers/driverController');

router.use(authenticateToken);

// School admin only routes
router.post('/', requireSchoolAdmin, addTransportRoute);
router.put('/:id', requireSchoolAdmin, updateTransportRoute);
router.delete('/:id', requireSchoolAdmin, deleteTransportRoute);

// Vehicles
router.get('/vehicles', getVehicles);
router.post('/vehicles', requireSchoolAdmin, addVehicle);
router.delete('/vehicles/:id', requireSchoolAdmin, deleteVehicle);

// Drivers
router.get('/drivers', getDrivers);
router.post('/drivers', requireSchoolAdmin, addDriver);
router.delete('/drivers/:id', requireSchoolAdmin, deleteDriver);

// Accessible by school admin and teachers
router.get('/', getTransportRoutes);
router.get('/route/:route', getStudentsByRoute);

module.exports = router;