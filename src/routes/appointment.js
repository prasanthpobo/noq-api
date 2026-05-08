const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createAppointmentSchema,
  updateAppointmentSchema,
} = require('../validators/appointmentValidators');

router.use(authenticate);

router.post('/', validate(createAppointmentSchema), appointmentController.createAppointment);
router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', validate(updateAppointmentSchema), appointmentController.updateAppointment);
router.post('/:id/convert-to-token', appointmentController.convertToToken);

module.exports = router;
