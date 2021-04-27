const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const authFilters = require('../filters/authFilters');
const userFilters = require('../filters/userFilters');

const router = express.Router();

router.post('/signup', authFilters.signup, authController.signup);
router.post(
  '/signup/complete/:token',
  authFilters.signupComplete,
  authController.signupComplete
);

router.post('/login', authFilters.login, authController.login);

router.get('/logout', authController.logout);

router.post(
  '/forgotPassword',
  authFilters.forgotPassword,
  authController.forgotPassword
);

router.patch(
  '/resetPassword/:token',
  authFilters.resetPassword,
  authController.resetPassword
);

router.patch(
  '/updateMyPassword',
  authFilters.updateMyPassword,
  authController.protect,
  authController.updateMyPassword
);

router.patch(
  '/changeMyEmail',
  authFilters.changeMyEmail,
  authController.protect,
  authController.changeMyEmail
);

router.patch(
  '/changeMyEmail/verify',
  authFilters.changeMyEmailVerify,
  authController.protect,
  authController.containsOtpForEmailChange,
  authController.isValidChangeEmailSession,
  authController.changeMyEmailVerify
);

router.patch(
  '/changeMyEmail/resendOtp/old',
  authFilters.changeMyEmailResendOtp,
  authController.protect,
  authController.isValidChangeEmailSession,
  authController.changeMyEmailResendOtp('old')
);

router.patch(
  '/changeMyEmail/resendOtp/new',
  authFilters.changeMyEmailResendOtp,
  authController.protect,
  authController.isValidChangeEmailSession,
  authController.changeMyEmailResendOtp('new')
);

router.patch(
  '/updateMe',
  userFilters.updateMe,
  authController.protect,
  userController.updateMe
);

router.patch(
  '/:id/makeActive',
  userFilters.makeUserActive,
  authController.protect,
  authController.restrictTo('admin'),
  userController.makeUserActive
);

router.patch(
  '/:id/makeInactive',
  userFilters.makeUserInactive,
  authController.protect,
  authController.restrictTo('admin'),
  userController.makeUserInactive
);

module.exports = router;
