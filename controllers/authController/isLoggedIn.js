const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const catchAsync = require('../../utils/catchAsync');
const User = require('../../models/userModel');

// Only for rendered pages generate no errors
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return next();
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('+role');

    if (!user || !user.active || user.hasChangedPasswordAfter(decoded.iat)) {
      res.clearCookie('jwt');
      return next();
    }

    res.locals.user = user;
    req.customs.user = user;
    return next();
  } catch (err) {
    return next();
  }
});
