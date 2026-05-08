const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Clinic = require('../models/Clinic');
const { AuthenticationError, NotFoundError } = require('../utils/errors');

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, clinicId: user.clinicId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const signRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, clinicId: user.clinicId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

const login = async ({ identifier, password, clinicId }) => {
  const query = { isActive: true };

  if (clinicId) {
    query.clinicId = clinicId;
  }

  const isEmail = identifier.includes('@');
  if (isEmail) {
    query.email = identifier.toLowerCase();
  } else {
    query.mobile = identifier;
  }

  const user = await User.findOne(query).select('+password');
  if (!user) throw new AuthenticationError('Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AuthenticationError('Invalid credentials');

  const clinic = await Clinic.findById(user.clinicId);
  if (!clinic || !clinic.isActive) {
    throw new AuthenticationError('Clinic is inactive or not found');
  }

  const accessToken = signToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken, clinic };
};

const refreshAccessToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AuthenticationError('Invalid refresh token');
  }

  const user = await User.findOne({
    _id: decoded.id,
    isActive: true,
  }).select('+refreshToken');

  if (!user || user.refreshToken !== refreshToken) {
    throw new AuthenticationError('Refresh token is invalid or expired');
  }

  const accessToken = signToken(user);
  return { accessToken };
};

module.exports = { login, refreshAccessToken, signToken };
