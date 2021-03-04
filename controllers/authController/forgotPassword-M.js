const ms = require('ms');

const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const User = require('../../models/userModel');
const sendEmail = require('../../utils/sendEmail');
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
    console.log('No user');
    return res.status(200).json(response);
  }

  const resetToken = user.createToken();
  await user.save({ validateBeforeSave: false });

  // console.log('Hashed Token: ', user.passwordResetToken);
  // console.log('Unhashed Token: ', resetToken);

  const url = `${req.protocol}://${req.get(
    'host'
  )}/resetPassword/${resetToken}`;

  await sendEmail({
    email,
    subject: `Forgot your password (Link valid for ${ms(
      ms(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN),
      { long: true }
    )})`,
    message: `To complete your forgot password request on Benfr click on the url: ${url}\nIf you haven't made the request, kindly ignore this email.`,
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

  await sendEmail({
    email: user.email,
    subject: 'Password reset sucessfully',
    message: `This is to inform you that your password on Benfr has been reseted recently at ${dateTimeDayFormatted(
      Date.now()
    )}(IST).\nPlease don't share your login details with anyone even if the person claims to be and/or is Benfr employee.`,
  });

  await addJWTToResponseCookie(req, res, user.id);

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully',
  });
});
