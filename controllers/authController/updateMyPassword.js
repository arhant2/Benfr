const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const User = require('../../models/userModel');
const sendEmail = require('../../utils/sendEmail');
const { dateTimeDayFormatted } = require('../../utils/dateFormator');
const addJWTToResponseCookie = require('./addJWTToResponseCookie');

module.exports.updateMyPassword = catchAsync(async (req, res, next) => {
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
  const user = await User.findById(req.customs.user.id).select('+password');
  if (await user.isCorrectPassword(req.body.password)) {
    return next(new AppError('Current password is wrong', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  await sendEmail({
    email: user.email,
    subject: 'Password is changed sucessfully',
    message: `This is to inform you that your password on MyElectronics has been changed recently at ${dateTimeDayFormatted(
      Date.now()
    )}(IST).\nPlease don't share your login details with anyone even if the person claim to be MyElectronics employee.`,
  });

  await addJWTToResponseCookie(req, res, user.id);

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
  });
});
