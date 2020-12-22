const AppError = require('../../utils/AppError');

module.exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.customs.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );
    }
    next();
  };
};
