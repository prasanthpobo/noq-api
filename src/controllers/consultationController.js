const Consultation = require('../models/Consultation');
const { Token } = require('../models/Token');
const { success, created } = require('../utils/response');
const { NotFoundError, ConflictError, AppError } = require('../utils/errors');

const createConsultation = async (req, res, next) => {
  try {
    const { tokenId, ...data } = req.body;

    const token = await Token.findOne({ _id: tokenId, clinicId: req.clinicId });
    if (!token) throw new NotFoundError('Token');
    if (!['waiting', 'in_progress'].includes(token.status)) {
      throw new AppError('Consultation can only be created for active tokens', 400);
    }

    const existing = await Consultation.findOne({ tokenId });
    if (existing) throw new ConflictError('Consultation already exists for this token');

    const consultation = await Consultation.create({
      ...data,
      tokenId,
      clinicId: req.clinicId,
      doctorId: token.doctorId,
      patientId: token.patientId,
      date: token.date,
    });

    // Auto-update token to in_progress if it's waiting
    if (token.status === 'waiting') {
      token.status = 'in_progress';
      token.calledAt = new Date();
      await token.save();
    }

    return created(res, { consultation }, 'Consultation created');
  } catch (err) {
    next(err);
  }
};

const getConsultationByToken = async (req, res, next) => {
  try {
    const consultation = await Consultation.findOne({
      tokenId: req.params.tokenId,
      clinicId: req.clinicId,
    })
      .populate('doctorId', 'name specialization qualification')
      .populate('patientId', 'name mobile gender age dob bloodGroup allergies chronicConditions');

    if (!consultation) throw new NotFoundError('Consultation');
    return success(res, { consultation });
  } catch (err) {
    next(err);
  }
};

const updateConsultation = async (req, res, next) => {
  try {
    const consultation = await Consultation.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.clinicId },
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name mobile gender age');

    if (!consultation) throw new NotFoundError('Consultation');
    return success(res, { consultation }, 'Consultation updated');
  } catch (err) {
    next(err);
  }
};

const signConsultation = async (req, res, next) => {
  try {
    const consultation = await Consultation.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.clinicId, isSigned: false },
      { $set: { isSigned: true, signedAt: new Date() } },
      { new: true }
    );

    if (!consultation) throw new NotFoundError('Consultation or already signed');

    // Auto-complete the token when consultation is signed
    await Token.findByIdAndUpdate(consultation.tokenId, {
      status: 'completed',
      completedAt: new Date(),
    });

    return success(res, { consultation }, 'Consultation signed and token completed');
  } catch (err) {
    next(err);
  }
};

const getPatientConsultations = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [consultations, total] = await Promise.all([
      Consultation.find({ patientId, clinicId: req.clinicId })
        .populate('doctorId', 'name specialization')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Consultation.countDocuments({ patientId, clinicId: req.clinicId }),
    ]);

    return success(res, { consultations, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createConsultation,
  getConsultationByToken,
  updateConsultation,
  signConsultation,
  getPatientConsultations,
};
