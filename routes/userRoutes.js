const express = require('express');

const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/signup/complete/:token', authController.signupComplete);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updateMyPassword
);

router.patch(
  '/changeMyEmail',
  authController.protect,
  authController.changeMyEmail
);

router.patch(
  '/changeMyEmail/verify',
  authController.protect,
  authController.containsOtpForEmailChange,
  authController.isValidChangeEmailSession,
  authController.changeMyEmailVerify
);

router.patch(
  '/changeMyEmail/resendOtp/old',
  authController.protect,
  authController.isValidChangeEmailSession,
  authController.changeMyEmailResendOtp('old')
);

router.patch(
  '/changeMyEmail/resendOtp/new',
  authController.protect,
  authController.isValidChangeEmailSession,
  authController.changeMyEmailResendOtp('new')
);

module.exports = router;
