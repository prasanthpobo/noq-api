const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
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
    date: {
      type: String,
      required: true, // YYYY-MM-DD
    },
    time: {
      type: String,
      required: true, // HH:MM
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
    },
    type: {
      type: String,
      enum: ['new', 'follow_up', 'emergency'],
      default: 'new',
    },
    reason: String,
    notes: String,
    tokenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
      default: null,
    },
    cancelReason: String,
    confirmedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ clinicId: 1, doctorId: 1, date: 1 });
appointmentSchema.index({ clinicId: 1, patientId: 1 });
appointmentSchema.index({ clinicId: 1, date: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
