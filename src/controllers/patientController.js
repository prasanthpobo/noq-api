const Patient = require('../models/Patient');
const { Token } = require('../models/Token');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');
const { success, created, paginated } = require('../utils/response');
const { NotFoundError, ConflictError } = require('../utils/errors');

const createPatient = async (req, res, next) => {
  try {
    const existing = await Patient.findOne({ clinicId: req.clinicId, mobile: req.body.mobile });
    if (existing) throw new ConflictError('Patient with this mobile already exists');

    const patient = await Patient.create({ ...req.body, clinicId: req.clinicId });
    return created(res, { patient }, 'Patient registered successfully');
  } catch (err) {
    next(err);
  }
};

const getPatients = async (req, res, next) => {
  try {
    const { q, mobile, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = { clinicId: req.clinicId, isActive: true };

    if (mobile) {
      query.mobile = mobile;
    } else if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { mobile: { $regex: q, $options: 'i' } },
      ];
    }

    const [patients, total] = await Promise.all([
      Patient.find(query).skip(skip).limit(Number(limit)).lean(),
      Patient.countDocuments(query),
    ]);

    return paginated(res, patients, total, page, limit);
  } catch (err) {
    next(err);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, clinicId: req.clinicId });
    if (!patient) throw new NotFoundError('Patient');
    return success(res, { patient });
  } catch (err) {
    next(err);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.clinicId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!patient) throw new NotFoundError('Patient');
    return success(res, { patient }, 'Patient updated');
  } catch (err) {
    next(err);
  }
};

const getPatientHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, clinicId: req.clinicId }).lean();
    if (!patient) throw new NotFoundError('Patient');

    const [consultations, appointments, tokens] = await Promise.all([
      Consultation.find({ patientId: req.params.id, clinicId: req.clinicId })
        .populate('doctorId', 'name specialization')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      Appointment.find({ patientId: req.params.id, clinicId: req.clinicId })
        .populate('doctorId', 'name specialization')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      Token.find({ patientId: req.params.id, clinicId: req.clinicId })
        .populate('doctorId', 'name specialization')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);

    return success(res, { patient, consultations, appointments, tokens });
  } catch (err) {
    next(err);
  }
};

const searchByMobile = async (req, res, next) => {
  try {
    const { mobile } = req.params;
    const patient = await Patient.findOne({ clinicId: req.clinicId, mobile });
    if (!patient) throw new NotFoundError('Patient');
    return success(res, { patient });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPatient, getPatients, getPatientById, updatePatient, getPatientHistory, searchByMobile };
