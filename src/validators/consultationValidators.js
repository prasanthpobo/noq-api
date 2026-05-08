const Joi = require('joi');

const medicineSchema = Joi.object({
  name: Joi.string().required(),
  dosage: Joi.string().optional().allow(''),
  frequency: Joi.string().optional().allow(''),
  duration: Joi.string().optional().allow(''),
  instructions: Joi.string().optional().allow(''),
  quantity: Joi.number().integer().min(0).optional(),
});

const vitalSchema = Joi.object({
  bp: Joi.string().optional().allow(''),
  pulse: Joi.number().optional(),
  temperature: Joi.number().optional(),
  weight: Joi.number().optional(),
  height: Joi.number().optional(),
  spo2: Joi.number().min(0).max(100).optional(),
  rbs: Joi.number().optional(),
});

const createConsultationSchema = Joi.object({
  tokenId: Joi.string().required(),
  chiefComplaint: Joi.string().optional().allow(''),
  symptoms: Joi.array().items(Joi.string()).optional(),
  diagnosis: Joi.string().optional().allow(''),
  differentialDiagnosis: Joi.array().items(Joi.string()).optional(),
  vitals: vitalSchema.optional(),
  medicines: Joi.array().items(medicineSchema).optional(),
  investigations: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().optional().allow(''),
  advice: Joi.string().optional().allow(''),
  followUpDate: Joi.date().min('now').optional(),
  followUpNotes: Joi.string().optional().allow(''),
});

const updateConsultationSchema = createConsultationSchema.fork(
  ['tokenId'],
  (schema) => schema.forbidden()
);

module.exports = { createConsultationSchema, updateConsultationSchema };
