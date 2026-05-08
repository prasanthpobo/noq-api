const mongoose = require('mongoose');

/**
 * TokenCounter provides atomic, concurrency-safe daily token number generation.
 * One document per (clinicId, doctorId, date) combination.
 */
const tokenCounterSchema = new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  lastToken: { type: Number, default: 0 },
});
tokenCounterSchema.index({ clinicId: 1, doctorId: 1, date: 1 }, { unique: true });

const TokenCounter = mongoose.model('TokenCounter', tokenCounterSchema);

const tokenSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true, // YYYY-MM-DD
    },
    status: {
      type: String,
      enum: ['waiting', 'in_progress', 'completed', 'cancelled'],
      default: 'waiting',
    },
    priority: {
      type: String,
      enum: ['normal', 'urgent', 'elderly', 'child'],
      default: 'normal',
    },
    estimatedTime: Date,
    calledAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

tokenSchema.index({ clinicId: 1, doctorId: 1, date: 1, tokenNumber: 1 }, { unique: true });
tokenSchema.index({ clinicId: 1, doctorId: 1, date: 1, status: 1 });
tokenSchema.index({ patientId: 1, date: 1 });

const Token = mongoose.model('Token', tokenSchema);

module.exports = { Token, TokenCounter };
