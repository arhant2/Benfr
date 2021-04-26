const User = require('../models/userModel');
const getBaseUrl = require('../utils/getBaseUrl');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Update me
exports.updateMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.customs.user.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Updated successfully!',
  });
});

// For admin(s) to make user active
exports.makeUserActive = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user find with that ID', 404));
  }

  user.active = true;

  user.baseUrlForEmail = getBaseUrl(req);

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Made user active successfully',
  });
});

// For admin(s) to make user inactive
exports.makeUserInactive = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user find with that ID', 404));
  }

  user.active = false;
  user.inActiveReason = req.body.inActiveReason;

  user.baseUrlForEmail = getBaseUrl(req);

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Made user inactive successfully',
  });
});
