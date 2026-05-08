const Joi = require('joi');

const createClinicSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  subdomain: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(3)
    .max(50)
    .required()
    .messages({ 'string.pattern.base': 'Subdomain can only contain lowercase letters, numbers, and hyphens' }),
  address: Joi.object({
    street: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow(''),
    state: Joi.string().optional().allow(''),
    country: Joi.string().optional().allow(''),
    pincode: Joi.string().optional().allow(''),
  }).optional(),
  phone: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  settings: Joi.object({
    tokenResetTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
    workingHours: Joi.object({
      start: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
      end: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
    }).optional(),
    appointmentDuration: Joi.number().integer().min(5).max(120).optional(),
  }).optional(),
  // Optional admin user creation fields
  adminName: Joi.string().optional(),
  adminEmail: Joi.string().email().optional(),
  adminMobile: Joi.string().optional(),
  adminPassword: Joi.string().min(6).optional(),
});

// All fields optional for partial updates; subdomain and admin fields are not updatable
const updateClinicSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  logo: Joi.string().uri().optional().allow(''),
  address: Joi.object({
    street: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow(''),
    state: Joi.string().optional().allow(''),
    country: Joi.string().optional().allow(''),
    pincode: Joi.string().optional().allow(''),
  }).optional(),
  settings: Joi.object({
    tokenResetTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
    workingHours: Joi.object({
      start: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
      end: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
    }).optional(),
    appointmentDuration: Joi.number().integer().min(5).max(120).optional(),
    currency: Joi.string().max(10).optional(),
  }).optional(),
});

module.exports = { createClinicSchema, updateClinicSchema };
