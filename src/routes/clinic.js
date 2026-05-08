const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const { createClinicSchema, updateClinicSchema } = require('../validators/clinicValidators');

// Public — create a new clinic (onboarding)
router.post('/', validate(createClinicSchema), clinicController.createClinic);

// List all clinics (super-admin use; in production, protect with a master key)
router.get('/', clinicController.listClinics);

// Authenticated clinic routes
router.get('/current', authenticate, clinicController.getClinic);
router.put('/current', authenticate, authorize('admin'), validate(updateClinicSchema), clinicController.updateClinic);

module.exports = router;
