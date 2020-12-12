const validator = require('validator');

const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const User = require('../../models/userModel');
const UnverifiedUser = require('../../models/unverifiedUserModel');
const sendEmail = require('../../utils/sendEmail');
const addJWTToResponseCookie = require('./addJWTToResponseCookie');
const cryptography = require('../../utils/crytography');

exports.signup = catchAsync(async (req, res, next) => {
  const response = {
    status: 'success',
    message: 'Verification email has been sent',
  };

  // 1) Check if given email is valid
  if (!req.body.email) {
    return next(new AppError('Please enter your email', 400));
  }

  // 2) normalize email
  const { email } = validator.normalizeEmail(req.body);

  // 3) check if user exits with that email
  if (await User.findOne({ email, active: { $in: [true, false] } })) {
    console.log('Users exists with that email');
    return next(new AppError('User already exists with that email', 400));
  }

  // 4) If the user account does not exists but has recently requested for signup
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
    return next(new AppError('Internal server error! Try again later', 500));
  }

  res.status(200).json(response);
});

exports.signupComplete = catchAsync(async (req, res, next) => {
  const hashedToken = cryptography.createHash(req.params.token);

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

  await sendEmail({
    email,
    subject: `Welcome to MyElectronics family`,
    message: `You have successfully signuped at MyElectronics`,
  });

  // 7) Send Response
  return res.status(201).json({
    status: 'success',
    message: 'Signup successful',
  });
});
