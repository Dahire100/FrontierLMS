// routes/disciplinary.js
const express = require('express');
const router = express.Router();
const disciplinaryController = require('../controllers/disciplinaryController');
const { authenticateToken } = require('../middleware/auth');

// INCIDENTS
router.post('/incidents', authenticateToken, disciplinaryController.createIncident);
router.get('/incidents', authenticateToken, disciplinaryController.getIncidents);
router.get('/incidents/stats', authenticateToken, disciplinaryController.getIncidentStats);
router.get('/incidents/student/:studentId', authenticateToken, disciplinaryController.getIncidentsByStudent);
router.get('/incidents/:id', authenticateToken, disciplinaryController.getIncidentById);
router.put('/incidents/:id', authenticateToken, disciplinaryController.updateIncident);
router.delete('/incidents/:id', authenticateToken, disciplinaryController.deleteIncident);

// PARAMETERS
router.get('/parameters', authenticateToken, disciplinaryController.getParameters);
router.post('/parameters', authenticateToken, disciplinaryController.createParameter);
router.put('/parameters/:id', authenticateToken, disciplinaryController.updateParameter);
router.delete('/parameters/:id', authenticateToken, disciplinaryController.deleteParameter);

// ASSESSMENTS
router.get('/assessments', authenticateToken, disciplinaryController.getAssessments);
router.post('/assessments', authenticateToken, disciplinaryController.createAssessment);

// COMPLAINTS
router.get('/complaints', authenticateToken, disciplinaryController.getDisciplinaryComplaints);

module.exports = router;
