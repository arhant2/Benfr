const validator = require('validator');

const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const User = require('../../models/userModel');
const UnverifiedUser = require('../../models/unverifiedUserModel');
const Email = require('../../utils/email');
const getBaseUrl = require('../../utils/getBaseUrl');
const addJWTToResponseCookie = require('./addJWTToResponseCookie');
const cryptography = require('../../utils/crytography');

exports.signup = catchAsync(async (req, res, next) => {
  const response = {
    status: 'success',
    message: 'Verification email has been sent',
  };

  // // 1) Check if email is there
  if (!req.body.email) {
    return next(new AppError('Please enter an email', 400));
  }

  const { email } = req.body;

  // 2) check if user exits with that email
  if (await User.findOne({ email, active: { $in: [true, false] } })) {
    return next(
      new AppError(
        'User already exists with that email, please login instead',
        400
      )
    );
  }

  // 3) If the user account does not exists but has recently requested for signup
  let unverfiedUser = await UnverifiedUser.findOne({ email });

  //4.1) check if the maximum signup attempts has been exhausted
  if (unverfiedUser && unverfiedUser.attemptsExceeded()) {
    return res.status(200).json(response);
  }

  // 4.2) if no signup attempt has been made recently, add new unverifiedUser details
  if (!unverfiedUser) {
    unverfiedUser = new UnverifiedUser({ email });
  }

  // 5) Issue a token
  const token = unverfiedUser.createToken();
  await unverfiedUser.save();

  try {
    new Email({ email: email, name: 'User' }, getBaseUrl(req)).sendSignup({
      relativeUrl: `/signup/complete/${token}`,
      time: '24 hours',
    });
  } catch (err) {
    return next(new AppError('Internal server error! Try again later', 500));
  }

  res.status(200).json(response);
});

exports.signupComplete = catchAsync(async (req, res, next) => {
  const hashedToken = cryptography.createHash(req.params.token);

  const unverfiedUser = await UnverifiedUser.findOne({
    token: hashedToken,
  });
  // 1) Check if token actually belongs to an unverified user
  if (!unverfiedUser) {
    return next(
      new AppError(
        'Signup link expired or is invalid! Try with newer link or redo the signup process.',
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
  await addJWTToResponseCookie(req, res, user.id);

  new Email(user, getBaseUrl(req)).sendWelcome();

  // 7) Send Response
  return res.status(201).json({
    status: 'success',
    message: 'Signup successful',
  });
});
