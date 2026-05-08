const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/summary', dashboardController.getTodaySummary);
router.get('/waiting', dashboardController.getWaitingPatients);
router.get('/doctor-stats', dashboardController.getDoctorStats);
router.get('/recent-consultations', dashboardController.getRecentConsultations);

module.exports = router;
