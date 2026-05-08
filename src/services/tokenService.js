const { Token, TokenCounter } = require('../models/Token');
const Doctor = require('../models/Doctor');
const { NotFoundError, AppError } = require('../utils/errors');

/**
 * Atomically increments the daily token counter and returns the next token number.
 * Using findOneAndUpdate with upsert guarantees concurrency safety — no two
 * concurrent requests will receive the same token number for the same
 * (clinicId, doctorId, date) combination.
 */
const getNextTokenNumber = async (clinicId, doctorId, date) => {
  const counter = await TokenCounter.findOneAndUpdate(
    { clinicId, doctorId, date },
    { $inc: { lastToken: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return counter.lastToken;
};

/**
 * Generate a new token for a patient in a doctor's queue.
 */
const generateToken = async ({ clinicId, doctorId, patientId, priority, date, notes, appointmentId, createdBy }) => {
  const doctor = await Doctor.findOne({ _id: doctorId, clinicId, isActive: true });
  if (!doctor) throw new NotFoundError('Doctor');

  const tokenDate = date || new Date().toISOString().split('T')[0];

  const tokenNumber = await getNextTokenNumber(clinicId, doctorId, tokenDate);

  const token = await Token.create({
    clinicId,
    doctorId,
    patientId,
    tokenNumber,
    date: tokenDate,
    priority: priority || 'normal',
    notes,
    appointmentId: appointmentId || null,
    createdBy,
    status: 'waiting',
  });

  return token.populate([
    { path: 'patientId', select: 'name mobile gender age' },
    { path: 'doctorId', select: 'name specialization' },
  ]);
};

/**
 * Get the full queue for a doctor on a given date.
 */
const getQueue = async (clinicId, doctorId, date) => {
  const queueDate = date || new Date().toISOString().split('T')[0];

  const doctor = await Doctor.findOne({ _id: doctorId, clinicId, isActive: true }).lean();
  if (!doctor) throw new NotFoundError('Doctor');

  const tokens = await Token.find({
    clinicId,
    doctorId,
    date: queueDate,
    status: { $in: ['waiting', 'in_progress'] },
  })
    .populate('patientId', 'name mobile gender age')
    .sort({ priority: -1, tokenNumber: 1 })
    .lean();

  const completed = await Token.countDocuments({ clinicId, doctorId, date: queueDate, status: 'completed' });
  const cancelled = await Token.countDocuments({ clinicId, doctorId, date: queueDate, status: 'cancelled' });

  return {
    doctor,
    date: queueDate,
    queue: tokens,
    stats: {
      waiting: tokens.filter((t) => t.status === 'waiting').length,
      inProgress: tokens.filter((t) => t.status === 'in_progress').length,
      completed,
      cancelled,
      total: tokens.length + completed + cancelled,
    },
  };
};

/**
 * Update token status with proper timestamp tracking.
 */
const updateTokenStatus = async (tokenId, clinicId, status, cancelReason) => {
  const token = await Token.findOne({ _id: tokenId, clinicId });
  if (!token) throw new NotFoundError('Token');

  const validTransitions = {
    waiting: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled', 'waiting'],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[token.status].includes(status)) {
    throw new AppError(
      `Cannot transition token from '${token.status}' to '${status}'`,
      400
    );
  }

  token.status = status;
  if (status === 'in_progress') token.calledAt = new Date();
  if (status === 'completed') token.completedAt = new Date();
  if (status === 'cancelled') {
    token.cancelledAt = new Date();
    if (cancelReason) token.cancelReason = cancelReason;
  }

  await token.save();
  return token.populate([
    { path: 'patientId', select: 'name mobile gender age' },
    { path: 'doctorId', select: 'name specialization' },
  ]);
};

module.exports = { generateToken, getQueue, updateTokenStatus };
