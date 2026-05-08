const { AuthorizationError } = require('../utils/errors');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AuthorizationError(`Role '${req.user.role}' is not allowed to access this resource`)
      );
    }
    next();
  };
};

module.exports = { authorize };
