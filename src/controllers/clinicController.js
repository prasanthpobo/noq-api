const Clinic = require('../models/Clinic');
const User = require('../models/User');
const { success, created, paginated } = require('../utils/response');
const { NotFoundError, ConflictError } = require('../utils/errors');

const createClinic = async (req, res, next) => {
  try {
    const { subdomain } = req.body;

    const existing = await Clinic.findOne({ subdomain });
    if (existing) throw new ConflictError('Subdomain already taken');

    const clinic = await Clinic.create(req.body);

    // Auto-create admin user if provided
    let adminUser = null;
    if (req.body.adminName && (req.body.adminEmail || req.body.adminMobile)) {
      adminUser = await User.create({
        clinicId: clinic._id,
        name: req.body.adminName,
        email: req.body.adminEmail,
        mobile: req.body.adminMobile,
        password: req.body.adminPassword || 'Admin@123',
        role: 'admin',
      });
    }

    return created(res, { clinic, adminUser }, 'Clinic created successfully');
  } catch (err) {
    next(err);
  }
};

const getClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.clinicId);
    if (!clinic) throw new NotFoundError('Clinic');
    return success(res, { clinic });
  } catch (err) {
    next(err);
  }
};

const updateClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(
      req.clinicId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!clinic) throw new NotFoundError('Clinic');
    return success(res, { clinic }, 'Clinic updated successfully');
  } catch (err) {
    next(err);
  }
};

const listClinics = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [clinics, total] = await Promise.all([
      Clinic.find({ isActive: true }).skip(skip).limit(Number(limit)).lean(),
      Clinic.countDocuments({ isActive: true }),
    ]);

    return paginated(res, clinics, total, page, limit);
  } catch (err) {
    next(err);
  }
};

module.exports = { createClinic, getClinic, updateClinic, listClinics };
