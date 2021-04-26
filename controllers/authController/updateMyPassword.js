const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const User = require('../../models/userModel');
const Email = require('../../utils/email');
const getBaseUrl = require('../../utils/getBaseUrl');
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
        'Please enter Current password, Password and Confirm you password'
      )
    );
  }
  const user = await User.findById(req.customs.user.id).select('+password');
  if (!(await user.isCorrectPassword(req.body.currentPassword))) {
    return next(new AppError('Current Password is wrong', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  await new Email(user, getBaseUrl(req)).sendPasswordUpdateConfirmation({
    date: dateTimeDayFormatted(Date.now()),
  });

  await addJWTToResponseCookie(req, res, user.id);

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
  });
});
