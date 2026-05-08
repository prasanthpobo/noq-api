const { Token } = require('../models/Token');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Consultation = require('../models/Consultation');
const { success } = require('../utils/response');

const getTodaySummary = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const clinicId = req.clinicId;

    const [
      totalTokens,
      waitingTokens,
      inProgressTokens,
      completedTokens,
      cancelledTokens,
      totalAppointments,
      activeDoctors,
      newPatientsToday,
    ] = await Promise.all([
      Token.countDocuments({ clinicId, date: today }),
      Token.countDocuments({ clinicId, date: today, status: 'waiting' }),
      Token.countDocuments({ clinicId, date: today, status: 'in_progress' }),
      Token.countDocuments({ clinicId, date: today, status: 'completed' }),
      Token.countDocuments({ clinicId, date: today, status: 'cancelled' }),
      Appointment.countDocuments({ clinicId, date: today }),
      Doctor.countDocuments({ clinicId, isActive: true }),
      Patient.countDocuments({
        clinicId,
        createdAt: {
          $gte: new Date(today + 'T00:00:00.000Z'),
          $lte: new Date(today + 'T23:59:59.999Z'),
        },
      }),
    ]);

    return success(res, {
      date: today,
      tokens: {
        total: totalTokens,
        waiting: waitingTokens,
        inProgress: inProgressTokens,
        completed: completedTokens,
        cancelled: cancelledTokens,
      },
      appointments: {
        total: totalAppointments,
      },
      doctors: {
        active: activeDoctors,
      },
      patients: {
        newToday: newPatientsToday,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getWaitingPatients = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { doctorId } = req.query;

    const query = {
      clinicId: req.clinicId,
      date: today,
      status: { $in: ['waiting', 'in_progress'] },
    };
    if (doctorId) query.doctorId = doctorId;

    const tokens = await Token.find(query)
      .populate('patientId', 'name mobile gender age')
      .populate('doctorId', 'name specialization')
      .sort({ priority: -1, tokenNumber: 1 })
      .lean();

    return success(res, { tokens, count: tokens.length });
  } catch (err) {
    next(err);
  }
};

const getDoctorStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const clinicId = req.clinicId;

    const doctors = await Doctor.find({ clinicId, isActive: true }).lean();

    const stats = await Promise.all(
      doctors.map(async (doctor) => {
        const [waiting, completed, inProgress] = await Promise.all([
          Token.countDocuments({ clinicId, doctorId: doctor._id, date: today, status: 'waiting' }),
          Token.countDocuments({ clinicId, doctorId: doctor._id, date: today, status: 'completed' }),
          Token.countDocuments({ clinicId, doctorId: doctor._id, date: today, status: 'in_progress' }),
        ]);
        return {
          doctor: { _id: doctor._id, name: doctor.name, specialization: doctor.specialization },
          waiting,
          inProgress,
          completed,
          total: waiting + inProgress + completed,
        };
      })
    );

    return success(res, { date: today, doctors: stats });
  } catch (err) {
    next(err);
  }
};

const getRecentConsultations = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const consultations = await Consultation.find({ clinicId: req.clinicId })
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name mobile age gender')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return success(res, { consultations });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTodaySummary, getWaitingPatients, getDoctorStats, getRecentConsultations };
