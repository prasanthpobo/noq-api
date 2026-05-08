const Clinic = require('../models/Clinic');
const { AppError } = require('../utils/errors');

/**
 * Resolves the tenant (clinic) from the x-clinic-id header or subdomain.
 * Attach clinic to req.clinic and clinicId to req.clinicId.
 * Used for public routes before authentication.
 */
const resolveTenant = async (req, res, next) => {
  try {
    const clinicId = req.headers['x-clinic-id'];
    const subdomain = req.headers['x-subdomain'] || req.subdomains?.[0];

    let clinic = null;

    if (clinicId) {
      clinic = await Clinic.findOne({ _id: clinicId, isActive: true });
    } else if (subdomain) {
      clinic = await Clinic.findOne({ subdomain, isActive: true });
    }

    if (!clinic) {
      return next(new AppError('Clinic not found or inactive', 404));
    }

    req.clinic = clinic;
    req.clinicId = clinic._id;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { resolveTenant };
