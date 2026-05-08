const appointmentService = require('../services/appointmentService');
const Appointment = require('../models/Appointment');
const { success, created, paginated } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

const createAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.createAppointment({
      ...req.body,
      clinicId: req.clinicId,
      createdBy: req.user._id,
    });

    const populated = await appointment.populate([
      { path: 'doctorId', select: 'name specialization' },
      { path: 'patientId', select: 'name mobile' },
    ]);

    return created(res, { appointment: populated }, 'Appointment booked successfully');
  } catch (err) {
    next(err);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const { date, doctorId, patientId, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = { clinicId: req.clinicId };
    if (date) query.date = date;
    if (doctorId) query.doctorId = doctorId;
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('doctorId', 'name specialization')
        .populate('patientId', 'name mobile gender age')
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Appointment.countDocuments(query),
    ]);

    return paginated(res, appointments, total, page, limit);
  } catch (err) {
    next(err);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, clinicId: req.clinicId })
      .populate('doctorId', 'name specialization consultationFee')
      .populate('patientId', 'name mobile gender age')
      .populate('tokenId');

    if (!appointment) throw new NotFoundError('Appointment');
    return success(res, { appointment });
  } catch (err) {
    next(err);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const update = { ...req.body };

    if (update.status === 'confirmed') update.confirmedAt = new Date();
    if (update.status === 'completed') update.completedAt = new Date();
    if (update.status === 'cancelled') update.cancelledAt = new Date();

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.clinicId },
      { $set: update },
      { new: true, runValidators: true }
    )
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name mobile');

    if (!appointment) throw new NotFoundError('Appointment');
    return success(res, { appointment }, 'Appointment updated');
  } catch (err) {
    next(err);
  }
};

const convertToToken = async (req, res, next) => {
  try {
    const result = await appointmentService.convertToToken(
      req.params.id,
      req.clinicId,
      req.user._id
    );
    return created(res, result, `Token #${result.token.tokenNumber} generated from appointment`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  convertToToken,
};
