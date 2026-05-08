const Joi = require('joi');

const createPatientSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  mobile: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({ 'string.pattern.base': 'Mobile must be 10 digits' }),
  email: Joi.string().email().optional().allow(''),
  dob: Joi.date().max('now').optional(),
  age: Joi.number().integer().min(0).max(150).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  bloodGroup: Joi.string()
    .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '')
    .optional(),
  address: Joi.object({
    street: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow(''),
    state: Joi.string().optional().allow(''),
    pincode: Joi.string().optional().allow(''),
  }).optional(),
  allergies: Joi.array().items(Joi.string()).optional(),
  chronicConditions: Joi.array().items(Joi.string()).optional(),
  emergencyContact: Joi.object({
    name: Joi.string().optional().allow(''),
    mobile: Joi.string().optional().allow(''),
    relation: Joi.string().optional().allow(''),
  }).optional(),
});

const updatePatientSchema = createPatientSchema.fork(
  ['name', 'mobile'],
  (schema) => schema.optional()
);

const searchPatientSchema = Joi.object({
  q: Joi.string().optional(),
  mobile: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = { createPatientSchema, updatePatientSchema, searchPatientSchema };
