const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validate');
const {
  createPatientSchema,
  updatePatientSchema,
  searchPatientSchema,
} = require('../validators/patientValidators');

router.use(authenticate);

router.post('/', validate(createPatientSchema), patientController.createPatient);
router.get('/', validateQuery(searchPatientSchema), patientController.getPatients);
router.get('/search/:mobile', patientController.searchByMobile);
router.get('/:id', patientController.getPatientById);
router.put('/:id', validate(updatePatientSchema), patientController.updatePatient);
router.get('/:id/history', patientController.getPatientHistory);

module.exports = router;
