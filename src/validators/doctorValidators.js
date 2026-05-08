const Joi = require('joi');

const timeSlotSchema = Joi.object({
  start: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .required(),
  end: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .required(),
  maxTokens: Joi.number().integer().min(1).default(20),
});

const availabilitySchema = Joi.object({
  day: Joi.string()
    .valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    .required(),
  isAvailable: Joi.boolean().default(true),
  slots: Joi.array().items(timeSlotSchema).optional(),
});

const createDoctorSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  mobile: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  specialization: Joi.string().required(),
  qualification: Joi.string().optional().allow(''),
  registrationNumber: Joi.string().optional().allow(''),
  experience: Joi.number().integer().min(0).optional(),
  consultationFee: Joi.number().min(0).optional(),
  availability: Joi.array().items(availabilitySchema).optional(),
  userId: Joi.string().optional(),
});

const updateDoctorSchema = createDoctorSchema.fork(
  ['name', 'specialization'],
  (schema) => schema.optional()
);

module.exports = { createDoctorSchema, updateDoctorSchema };
