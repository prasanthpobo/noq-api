const authService = require('../services/authService');
const User = require('../models/User');
const Clinic = require('../models/Clinic');
const { success, created, error } = require('../utils/response');
const { ConflictError, AuthenticationError } = require('../utils/errors');

const login = async (req, res, next) => {
  try {
    const { identifier, password, clinicId } = req.body;
    const result = await authService.login({ identifier, password, clinicId: clinicId || req.clinicId });

    return success(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
      clinic: result.clinic,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const clinicId = req.clinicId || req.body.clinicId;

    if (req.body.email) {
      const exists = await User.findOne({ clinicId, email: req.body.email });
      if (exists) throw new ConflictError('Email already registered in this clinic');
    }
    if (req.body.mobile) {
      const exists = await User.findOne({ clinicId, mobile: req.body.mobile });
      if (exists) throw new ConflictError('Mobile already registered in this clinic');
    }

    const user = await User.create({ ...req.body, clinicId });
    const accessToken = authService.signToken(user);

    return created(res, { user, accessToken }, 'User registered successfully');
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new AuthenticationError('Refresh token required');
    const result = await authService.refreshAccessToken(token);
    return success(res, result, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('clinicId');
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new AuthenticationError('Current password is incorrect');
    user.password = newPassword;
    await user.save();
    return success(res, {}, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    return success(res, {}, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, refreshToken, getMe, changePassword, logout };
