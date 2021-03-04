const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

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
