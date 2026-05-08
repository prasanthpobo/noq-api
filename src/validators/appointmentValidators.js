const Joi = require('joi');

const createAppointmentSchema = Joi.object({
  doctorId: Joi.string().required(),
  patientId: Joi.string().required(),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  time: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .required(),
  type: Joi.string().valid('new', 'follow_up', 'emergency').default('new'),
  reason: Joi.string().optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

const updateAppointmentSchema = Joi.object({
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  time: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .optional(),
  status: Joi.string()
    .valid('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')
    .optional(),
  type: Joi.string().valid('new', 'follow_up', 'emergency').optional(),
  reason: Joi.string().optional().allow(''),
  notes: Joi.string().optional().allow(''),
  cancelReason: Joi.string().optional().allow(''),
});

module.exports = { createAppointmentSchema, updateAppointmentSchema };
