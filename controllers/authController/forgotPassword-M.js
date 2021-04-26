const ms = require('ms');

const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const User = require('../../models/userModel');
const Email = require('../../utils/email');
const getBaseUrl = require('../../utils/getBaseUrl');
const { dateTimeDayFormatted } = require('../../utils/dateFormator');
const addJWTToResponseCookie = require('./addJWTToResponseCookie');
const cryptography = require('../../utils/crytography');

exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(AppError('Please enter your email', 400));
  }

  const { email } = req.body;

  const user = await User.findOne({ email });
  const response = {
    status: 'success',
    message:
      'If the email has been found to be associated with a user, we had send a email with further instructions',
  };

  if (!user) {
    return res.status(200).json(response);
  }

  const resetToken = user.createToken();
  await user.save({ validateBeforeSave: false });

  await new Email(user, getBaseUrl(req)).sendPasswordResetToken({
    relativeUrl: `/resetPassword/${resetToken}`,
    time: ms(ms(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN), { long: true }),
  });

  res.status(200).json(response);
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = cryptography.createHash(req.params.token);

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

  await new Email(user, getBaseUrl(req)).sendPasswordResetConfirmation({
    date: dateTimeDayFormatted(Date.now()),
  });

  await addJWTToResponseCookie(req, res, user.id);

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully',
  });
});
