// const validator = require('validator');

const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const User = require('../../models/userModel');
const addJWTToResponseCookie = require('./addJWTToResponseCookie');

module.exports.login = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const { password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // if (!validator.isEmail(email)) {
  //   return next(new AppError('Please provide a valid email', 400));
  // }

  // email = validator.normalizeEmail(email);

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (user.failedLoginAttemptsExceeded()) {
    return next(
      new AppError('Too many login attempts! Please try again later', 429)
    );
  }

  if (!(await user.isCorrectPassword(req.body.password))) {
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Incorrect email or password', 401));
  }

  user.failedLoginAttemptsReset();
  user.save({ validateBeforeSave: false });

  await addJWTToResponseCookie(req, res, user._id);

  // console.log('arhant from here');

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
  });
});
