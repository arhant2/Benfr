const { promisify } = require('util');

const validator = require('validator');
const ms = require('ms');
const jwt = require('jsonwebtoken');

const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const User = require('../../models/userModel');
const sendEmail = require('../../utils/sendEmail');

exports.changeMyEmail = catchAsync(async (req, res, next) => {
  if (!req.body.email || !validator.isEmail(req.body.email)) {
    return next(new AppError('Please enter a valid email', 400));
  }

  const oldEmail = req.customs.user.email;
  const newEmail = validator.normalizeEmail(req.body.email);

  if (oldEmail === newEmail) {
    return next(
      new AppError(
        'Current email and new email cannot be same for email updation'
      )
    );
  }

  if (
    await User.findOne({ email: newEmail, active: { $in: ['true', 'false'] } })
  ) {
    return next(
      new AppError('New email already exists with another account', 400)
    );
  }

  console.log('Abc: ', req.customs.user);

  const user = await User.findById(req.customs.user.id).select(
    '+changeEmailDetails'
  );

  if (user.emailChangeNewAttemptsExceeded()) {
    return next(
      new AppError(
        'Too many requests for email change! Please try again after some time',
        429
      )
    );
  }

  const { oldEmailOtp, newEmailOtp } = user.changeEmailOtpCreator(newEmail);
  await user.save({ validateBeforeSave: false });

  try {
    const validFor = ms(ms(process.env.OTP_EXPIRES_IN), { long: true });
    await Promise.all([
      sendEmail({
        email: oldEmail,
        subject: `Otp to change email on MyElectronics (valid for ${validFor})`,
        message: `Otp to change on MyElectronics to ${newEmail} is: ${oldEmailOtp}`,
      }),
      sendEmail({
        email: newEmail,
        subject: `Otp to add your email on MyElectronics (valid for ${validFor})`,
        message: `Otp to add your email with an account on MyElectronics is: ${newEmailOtp}`,
      }),
    ]);
  } catch (err) {
    return next(new AppError('Internal server error! Try again later', 500));
  }

  const token = await promisify(jwt.sign)(
    { id: user.id, oldEmail, newEmail },
    process.env.OTP_JWT_SECRET,
    {
      expiresIn: process.env.OTP_EXPIRES_IN,
    }
  );

  res.cookie('changeEmailJwt', token, {
    expires: new Date(Date.now() + ms(process.env.OTP_EXPIRES_IN)),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  res.status(200).json({
    status: 'success',
    message: 'Otp sent to change your email',
  });
});

exports.containsOtpForEmailChange = (req, res, next) => {
  if (!req.body.oldEmailOtp || !req.body.newEmailOtp) {
    return next(
      new AppError('Please provide otps sent to new and current email', 400)
    );
  }
  next();
};

exports.isValidChangeEmailSession = catchAsync(async (req, res, next) => {
  const changeEmailInvalidSessionRespond = () => {
    res.clearCookie('changeEmailJwt');
    return next(new AppError('Session expired or invalid! Please retry', 400));
  };

  if (!req.cookies.changeEmailJwt) {
    return changeEmailInvalidSessionRespond();
  }
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(
      req.cookies.changeEmailJwt,
      process.env.OTP_JWT_SECRET
    );
  } catch (err) {
    return changeEmailInvalidSessionRespond();
  }
  if (decoded.id !== req.customs.user.id) {
    return changeEmailInvalidSessionRespond();
  }
  const user = await User.findById(req.customs.user.id).select(
    '+changeEmailDetails'
  );
  if (
    !user.changeEmailDetails ||
    !user.areValidEmailsForChangeEmail(decoded.oldEmail, decoded.newEmail)
  ) {
    return changeEmailInvalidSessionRespond();
  }
  req.customs.user = user;
  next();
});

// If new email id is signuped in between it is not an issue, mongodb will automatically handle that with runValidatorsBeforeSave to false as email is unique which is an index and not mongoose specific validator
exports.changeMyEmailVerify = catchAsync(async (req, res, next) => {
  const { user } = req.customs;
  const { oldEmailOtp, newEmailOtp } = req.body;
  if (req.customs.user.emailChangeVerifyExceeded()) {
    return next(
      new AppError(
        'Too many failed attempts to change email! Please try again later'
      )
    );
  }
  if (!user.areValidOtpsForEmailChange(oldEmailOtp, newEmailOtp)) {
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'Incorrect details! Please enter the correct otps or retry again',
        400
      )
    );
  }

  const oldEmail = user.changeEmailDetails.old.email;
  const newEmail = user.changeEmailDetails.new.email;

  user.email = user.changeEmailDetails.new.email;
  user.changeEmailDetails = undefined;
  await user.save({ validateBeforeSave: false });

  res.clearCookie('changeEmailJwt');

  try {
    // const validFor = ms(ms(process.env.OTP_EXPIRES_IN), { long: true });
    await Promise.all([
      sendEmail({
        email: oldEmail,
        subject: `Email changed sucessfully on MyElectronics`,
        message: `Your email has been changed successfully on MyElectronics.`,
      }),
      sendEmail({
        email: newEmail,
        subject: `Email added sucessfully`,
        message: `Your email has been successfully added to an existing account on MyElectronics`,
      }),
    ]);
  } catch (err) {
    return res.status(200).json({
      status: 'success',
      message: 'Email changed successfully',
    });
  }

  return res.status(200).json({
    status: 'success',
    message: 'Email changed successfully',
  });
});

exports.changeMyEmailResendOtp = (type) =>
  catchAsync(async (req, res, next) => {
    const { user } = req.customs;
    if (user.otpResendExceeded(type)) {
      console.log('!!Too many requests, not sending otp');
      return res.status(200).json({
        status: 'success',
        message: 'Otp sent to change your email',
      });
    }
    const otp = user.recreateOtpForEmailChange(type);
    await user.save({ validateBeforeSave: false });

    const validFor = ms(ms(process.env.OTP_EXPIRES_IN), { long: true });

    try {
      await sendEmail({
        email: user.changeEmailDetails[type].email,
        subject:
          type === 'old'
            ? `Otp to change email on MyElectronics (valid for ${validFor})`
            : `Otp to add your email on MyElectronics (valid for ${validFor})`,
        message:
          type === 'old'
            ? `Otp to change on MyElectronics to ${user.changeEmailDetails.new.email} is: ${otp}`
            : `Otp to add your email with an account on MyElectronics is: ${otp}`,
      });
    } catch (err) {
      return next(new AppError('Internal server error! Try again later', 500));
    }

    res.status(200).json({
      status: 'success',
      message: 'Otp sent to change your email',
    });
  });
