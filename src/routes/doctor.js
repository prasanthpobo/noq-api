const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const { createDoctorSchema, updateDoctorSchema } = require('../validators/doctorValidators');

router.use(authenticate);

router.post('/', authorize('admin'), validate(createDoctorSchema), doctorController.createDoctor);
router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);
router.put('/:id', authorize('admin'), validate(updateDoctorSchema), doctorController.updateDoctor);
router.delete('/:id', authorize('admin'), doctorController.deleteDoctor);
router.put('/:id/availability', authorize('admin', 'doctor'), doctorController.updateAvailability);

module.exports = router;
