const crypto = require('crypto');
const { promisify } = require('util');

const validator = require('validator');
const jwt = require('jsonwebtoken');
const ms = require('ms');

const catchAsync = require('../utils/catchAsync');
const UnverifiedUser = require('../models/unverifiedUserModel');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/sendEmail');
const { dateTimeFormatted } = require('../utils/dateFormator');

const signJWTToken = async (id) => {
  return await promisify(jwt.sign)({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const addJWTToResponseCookie = async (req, res, userId) => {
  const token = await signJWTToken(userId);
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + ms(process.env.JWT_EXPIRES_IN)),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const response = {
    status: 'success',
    message:
      'Verification email has been sent if no user has been found to be associated with the given email',
  };

  // 1) Check if given email is valid
  if (!req.body) {
    return next(new AppError('Please enter your email', 400));
  }

  // 2) normalize email
  const { email } = req.body;

  // 3) check if user exits with that email
  if (await User.findOne({ email, active: { $in: [true, false] } })) {
    console.log('Users exists with that email');
    return res.status(200).json(response);
  }

  // 4) If the user account does not exists
  let unverfiedUser = await UnverifiedUser.findOne({ email });

  //4.1) check if the maximum signup attempts has been exhausted
  if (
    unverfiedUser &&
    unverfiedUser.attemptsCount >=
      (process.env.NEW_USER_SIGNUP_ATTEMPTS_IN_A_DAY || 3)
  ) {
    console.log('Maximum tries exceeded');
    return res.status(200).json(response);
  }

  // 4.2) check if signup attempt was made recently and has not exhausted, increment counter
  if (unverfiedUser) {
    unverfiedUser.attemptsCount += 1;
  }
  // 4.3) if no signup attempt has been made recently, add new unverifiedUser details
  else {
    unverfiedUser = new UnverifiedUser({ email });
  }

  // 5) Issue a token
  const token = unverfiedUser.createToken();
  await unverfiedUser.save();

  try {
    const url = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/signup/complete/${token}`;

    await sendEmail({
      email,
      subject:
        'Complete signup request on MyElectronics(Link Valid for 5 mins)',
      message: `To complete signup on MYElectronics click on the url: ${url}\nIf you haven't made the request, kindly ignore this email.`,
    });

    console.log('Email sent for signup');
  } catch (err) {
    return next(new AppError('Something went very wrong', 500));
  }

  res.status(200).json(response);
});

exports.signupComplete = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const unverfiedUser = await UnverifiedUser.findOne({
    token: hashedToken,
  });
  // 1) Check if token belongs to an unverified user
  if (!unverfiedUser) {
    return next(
      new AppError(
        'Signup link expired or is invalid! Please resend the link.',
        400
      )
    );
  }
  // 2) Check if the email entered and attached to the token are same
  const { email } = unverfiedUser;
  if (!req.body.email || validator.normalizeEmail(req.body.email) !== email) {
    return next(
      new AppError(
        'Invalid email, please use the same email for which the link is issued',
        400
      )
    );
  }
  // 3) Create user
  const user = await User.create(req.body);

  // 4) Delete unverfied userToken
  await UnverifiedUser.findByIdAndDelete(unverfiedUser._id);

  // 5) Issue JWT
  await addJWTToResponseCookie(req, res, user._id);

  // 6) Delete password
  user.password = undefined;

  // 7) Send Response
  return res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  let { email } = req.body;
  const { password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  if (!validator.isEmail(email)) {
    return next(new AppError('Please provide a valid email', 400));
  }

  email = validator.normalizeEmail(email);

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isCorrectPassword(req.body.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  await addJWTToResponseCookie(req, res, user._id);

  res.status(200).json({
    status: 'success',
  });
});

exports.logout = (req, res, next) => {
  res.clearCookie('jwt');
  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
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

  req.user = user;
  res.locals.user = user;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(AppError('Please enter your email', 400));
  }

  let { email } = req.body;
  const user = await User.findOne({ email });
  const response = {
    status: 'success',
    message:
      'If the email has been found to be associated with a user, we had send a email with further instructions',
  };

  if (!user) {
    console.log('No user');
    return res.status(200).json(response);
  }

  ({ email } = user);

  const resetToken = user.createToken();
  await user.save({ validateBeforeSave: false });

  console.log('Hashed Token: ', user.passwordResetToken);
  console.log('Unhashed Token: ', resetToken);

  const url = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetMyPassword/${resetToken}`;

  await sendEmail({
    email,
    subject: `Forgot your password (Link valid for ${ms(
      ms(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN),
      { long: true }
    )})`,
    message: `To complete your forgot password request on MYElectronics click on the url: ${url}\nIf you haven't made the request, kindly ignore this email.`,
  });

  res.status(200).json(response);
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Given link is invalid', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  await sendEmail({
    email: user.email,
    subject: 'Password reset sucessfully',
    message: `This is to inform you that your password on MyElectronics has been reseted recently at ${dateTimeFormatted(
      Date.now()
    )}(IST).\nPlease don't share your login details with anyone even if the person claim to be MyElectronics employee.`,
  });

  await addJWTToResponseCookie(req, res, user.id);

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully',
  });
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  if (
    !req.body.currentPassword ||
    !req.body.password ||
    !req.body.passwordConfirm
  ) {
    return next(
      new AppError(
        'Please enter current password, password and confirm you password'
      )
    );
  }
  const user = await User.findById(req.user.id).select('+password');
  if (await user.isCorrectPassword(req.body.password)) {
    return next(new AppError('Current password is wrong', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  await sendEmail({
    email: user.email,
    subject: 'Password is changed sucessfully',
    message: `This is to inform you that your password on MyElectronics has been changed recently at ${dateTimeFormatted(
      Date.now()
    )}(IST).\nPlease don't share your login details with anyone even if the person claim to be MyElectronics employee.`,
  });

  await addJWTToResponseCookie(req, res, user.id);

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
  });
});
