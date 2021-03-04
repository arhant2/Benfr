const express = require('express');

const authController = require('../controllers/authController');
const userViewController = require('../controllers/userViewController');

const router = express.Router();

router.get('/login', userViewController.getLogin);

router.get('/signup', userViewController.getSignup);
router.get('/signup/success', userViewController.getSignupSuccess);
router.get('/signup/complete/:token', userViewController.getSignupComplete);

router.get('/forgotPassword', userViewController.getForgotPassword);
router.get(
  '/forgotPassword/success',
  userViewController.getForgotPasswordSuccess
);

router.get('/resetPassword/:token', userViewController.getResetPassword);

router.get('/logout', userViewController.getLogout);

/* =====================================
All routes below will check if logged so to make changes in navbar  and also setEncodedUrl
===================================== */

router.use(userViewController.setEncodedUrl);
router.use(authController.isLoggedIn);

router.get('/', userViewController.getIndex);

router.get(
  '/myAccount',
  authController.protectView,
  userViewController.getMyAccount
);

router.get(
  '/updateMe',
  authController.protectView,
  userViewController.getUpdateMe
);

router.get(
  '/updateMyPassword',
  authController.protectView,
  userViewController.getUpdateMyPassword
);

router.get(
  '/changeMyEmail',
  authController.protectView,
  userViewController.getChangeMyEmail
);

module.exports = router;
