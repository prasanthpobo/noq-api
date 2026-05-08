const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { generateToken } = require('./tokenService');
const { NotFoundError, ConflictError } = require('../utils/errors');

const createAppointment = async ({ clinicId, doctorId, patientId, date, time, type, reason, notes, createdBy }) => {
  const doctor = await Doctor.findOne({ _id: doctorId, clinicId, isActive: true });
  if (!doctor) throw new NotFoundError('Doctor');

  const existing = await Appointment.findOne({
    clinicId,
    doctorId,
    patientId,
    date,
    status: { $in: ['scheduled', 'confirmed'] },
  });
  if (existing) {
    throw new ConflictError('Patient already has an appointment with this doctor on this date');
  }

  return Appointment.create({
    clinicId,
    doctorId,
    patientId,
    date,
    time,
    type: type || 'new',
    reason,
    notes,
    createdBy,
    status: 'scheduled',
  });
};

/**
 * Convert an appointment to a token and mark the appointment as in_progress.
 */
const convertToToken = async (appointmentId, clinicId, createdBy) => {
  const appointment = await Appointment.findOne({ _id: appointmentId, clinicId });
  if (!appointment) throw new NotFoundError('Appointment');

  if (appointment.tokenId) {
    throw new ConflictError('Token already generated for this appointment');
  }

  if (!['scheduled', 'confirmed'].includes(appointment.status)) {
    throw new ConflictError('Only scheduled or confirmed appointments can be converted to tokens');
  }

  const token = await generateToken({
    clinicId,
    doctorId: appointment.doctorId,
    patientId: appointment.patientId,
    date: appointment.date,
    appointmentId: appointment._id,
    createdBy,
  });

  appointment.tokenId = token._id;
  appointment.status = 'in_progress';
  await appointment.save();

  return { appointment, token };
};

module.exports = { createAppointment, convertToToken };
