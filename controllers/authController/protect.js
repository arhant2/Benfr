const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const User = require('../../models/userModel');

module.exports.protect = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;

  const error = new AppError('You are not logged in! Login to get access', 401);

  if (!token) {
    console.log('No token');
    return next(error);
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select('+role');

  if (!user || user.hasChangedPasswordAfter(decoded.iat)) {
    console.log('No user or password changed recently');
    res.clearCookie('jwt');
    return next(error);
  }

  req.customs.user = user;
  res.locals.user = user;

  next();
});
