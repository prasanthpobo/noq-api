const tokenService = require('../services/tokenService');
const { Token } = require('../models/Token');
const { success, created, paginated } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

const generateToken = async (req, res, next) => {
  try {
    const { doctorId, patientId, priority, date, notes, appointmentId } = req.body;

    const token = await tokenService.generateToken({
      clinicId: req.clinicId,
      doctorId,
      patientId,
      priority,
      date,
      notes,
      appointmentId,
      createdBy: req.user._id,
    });

    return created(res, { token }, `Token #${token.tokenNumber} generated`);
  } catch (err) {
    next(err);
  }
};

const getQueue = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const queueData = await tokenService.getQueue(req.clinicId, doctorId, date);
    return success(res, queueData);
  } catch (err) {
    next(err);
  }
};

const updateTokenStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancelReason } = req.body;

    const token = await tokenService.updateTokenStatus(id, req.clinicId, status, cancelReason);
    return success(res, { token }, `Token status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};

const getTokenById = async (req, res, next) => {
  try {
    const token = await Token.findOne({ _id: req.params.id, clinicId: req.clinicId })
      .populate('patientId', 'name mobile gender age')
      .populate('doctorId', 'name specialization')
      .lean();
    if (!token) throw new NotFoundError('Token');
    return success(res, { token });
  } catch (err) {
    next(err);
  }
};

const getTokensByDate = async (req, res, next) => {
  try {
    const { date, doctorId, status, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      clinicId: req.clinicId,
      date: date || new Date().toISOString().split('T')[0],
    };
    if (doctorId) query.doctorId = doctorId;
    if (status) query.status = status;

    const [tokens, total] = await Promise.all([
      Token.find(query)
        .populate('patientId', 'name mobile gender age')
        .populate('doctorId', 'name specialization')
        .sort({ tokenNumber: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Token.countDocuments(query),
    ]);

    return paginated(res, tokens, total, page, limit);
  } catch (err) {
    next(err);
  }
};

module.exports = { generateToken, getQueue, updateTokenStatus, getTokenById, getTokensByDate };
