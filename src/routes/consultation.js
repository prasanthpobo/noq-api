const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const {
  createConsultationSchema,
  updateConsultationSchema,
} = require('../validators/consultationValidators');

router.use(authenticate);

router.post('/', validate(createConsultationSchema), consultationController.createConsultation);
router.get('/token/:tokenId', consultationController.getConsultationByToken);
router.get('/patient/:patientId', consultationController.getPatientConsultations);
router.put('/:id', validate(updateConsultationSchema), consultationController.updateConsultation);
router.put('/:id/sign', authorize('doctor', 'admin'), consultationController.signConsultation);

module.exports = router;
