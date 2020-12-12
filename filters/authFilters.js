const filterBodyMiddleware = require('../utils/filterBodyMiddleware');

exports.signup = filterBodyMiddleware(['email']);

exports.signupComplete = filterBodyMiddleware([
  'name',
  'email',
  'mobile',
  'password',
  'passwordConfirm',
]);

exports.login = filterBodyMiddleware(['email', 'password']);
exports.forgotPassword = filterBodyMiddleware(['email']);

exports.resetPassword = filterBodyMiddleware(['password', 'passwordConfirm']);

exports.updateMyPassword = filterBodyMiddleware([
  'currentPassword',
  'password',
  'passwordConfirm',
]);

exports.changeMyEmail = filterBodyMiddleware(['email']);
exports.changeMyEmailVerify = filterBodyMiddleware([
  'newEmailOtp',
  'oldEmailOtp',
]);
exports.changeMyEmailResendOtp = filterBodyMiddleware([]);
