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

// router.get('/email', (req, res, next) => {
//   res.status(200).render('email/index', {
//     heading: 'Welcome to Benfr Family!',
//     text:
//       'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque harum laboriosam magni vitae magnam reprehenderit quo, perferendis obcaecati dolores sunt doloremque ab at ipsa quia incidunt voluptate deserunt, corporis quasi eius veniam esse. Eos omnis eveniet facilis tempore cupiditate soluta sunt odio quos earum id corporis possimus odit, quis, unde ab debitis, quod dolorum esse alias labore enim atque. Dolor commodi animi repellendus temporibus unde numquam dolore, sunt, alias voluptatem eaque non aliquam dignissimos nostrum nam deserunt cupiditate optio! Pariatur molestias facere aut culpa, suscipit laudantium veritatis accusantium est ducimus voluptatum sapiente dicta dolorem exercitationem placeat aliquid hic harum in?',
//     link: {
//       href: 'www.benfr.com',
//       text: 'Go to Benfr',
//     },
//   });
// });

// const Email = require('../utils/email');

// router.get(
//   '/sendEmail',
//   authController.isLoggedIn,
//   authController.protectView,
//   async (req, res, next) => {
//     new Email(
//       req.customs.user,
//       `${req.protocol}://${req.get('host')}`
//     ).sendWelcome();

//     res.status(200).send('Sucessful');
//   }
// );

module.exports = router;
