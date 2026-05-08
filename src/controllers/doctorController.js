const Doctor = require('../models/Doctor');
const { success, created, paginated } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

const createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create({ ...req.body, clinicId: req.clinicId });
    return created(res, { doctor }, 'Doctor added successfully');
  } catch (err) {
    next(err);
  }
};

const getDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, specialization } = req.query;
    const skip = (page - 1) * limit;

    const query = { clinicId: req.clinicId, isActive: true };
    if (specialization) query.specialization = new RegExp(specialization, 'i');

    const [doctors, total] = await Promise.all([
      Doctor.find(query).skip(skip).limit(Number(limit)).lean(),
      Doctor.countDocuments(query),
    ]);

    return paginated(res, doctors, total, page, limit);
  } catch (err) {
    next(err);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.params.id, clinicId: req.clinicId });
    if (!doctor) throw new NotFoundError('Doctor');
    return success(res, { doctor });
  } catch (err) {
    next(err);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.clinicId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!doctor) throw new NotFoundError('Doctor');
    return success(res, { doctor }, 'Doctor updated successfully');
  } catch (err) {
    next(err);
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.clinicId },
      { isActive: false },
      { new: true }
    );
    if (!doctor) throw new NotFoundError('Doctor');
    return success(res, {}, 'Doctor deactivated');
  } catch (err) {
    next(err);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.clinicId },
      { $set: { availability: req.body.availability } },
      { new: true, runValidators: true }
    );
    if (!doctor) throw new NotFoundError('Doctor');
    return success(res, { doctor }, 'Availability updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor, updateAvailability };
