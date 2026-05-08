const Joi = require('joi');

const generateTokenSchema = Joi.object({
  doctorId: Joi.string().required(),
  patientId: Joi.string().required(),
  priority: Joi.string().valid('normal', 'urgent', 'elderly', 'child').default('normal'),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  notes: Joi.string().optional().allow(''),
  appointmentId: Joi.string().optional(),
});

const updateTokenStatusSchema = Joi.object({
  status: Joi.string()
    .valid('waiting', 'in_progress', 'completed', 'cancelled')
    .required(),
  cancelReason: Joi.string().when('status', {
    is: 'cancelled',
    then: Joi.optional().allow(''),
    otherwise: Joi.forbidden(),
  }),
});

module.exports = { generateTokenSchema, updateTokenStatusSchema };
