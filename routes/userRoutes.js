const express = require('express');

const authController = require('../controllers/authController');
const authFilters = require('../filters/authFilters');

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

module.exports = router;
