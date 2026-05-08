const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuthenticationError } = require('../utils/errors');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.id,
      clinicId: decoded.clinicId,
      isActive: true,
    });

    if (!user) throw new AuthenticationError('User not found or inactive');

    req.user = user;
    req.clinicId = user.clinicId;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Invalid or expired token'));
    }
    next(err);
  }
};

module.exports = { authenticate };
