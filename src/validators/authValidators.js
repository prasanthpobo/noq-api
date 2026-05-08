const Joi = require('joi');

const loginSchema = Joi.object({
  identifier: Joi.string().required().messages({
    'any.required': 'Email or mobile is required',
  }),
  password: Joi.string().required(),
  clinicId: Joi.string().optional(),
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().optional().allow(''),
  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .messages({ 'string.pattern.base': 'Invalid Indian mobile number' }),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'doctor', 'staff').default('staff'),
}).or('email', 'mobile');

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

module.exports = { loginSchema, registerSchema, changePasswordSchema };
