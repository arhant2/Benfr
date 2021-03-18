const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const cryptography = require('../utils/crytography');
const User = require('../models/userModel');
const UnverifiedUser = require('../models/unverifiedUserModel');
const Brand = require('../models/brandModel');
const Category = require('../models/categoryModel');

exports.setEncodedUrl = (req, res, next) => {
  res.locals.encodedUrl = encodeURIComponent(req.originalUrl);
  req.customs.encodedUrl = res.locals.encodedUrl;
  next();
};

exports.setSidebarItems = catchAsync(async (req, res, next) => {
  try {
    const [brands, categories] = await Promise.all([
      Brand.find().sort('-score -productsCount -updatedAt').limit(4),
      Category.find().sort('-score -productsCount -updatedAt').limit(4),
    ]);

    res.locals.sidebarDocuments = { brands, categories };
  } catch (err) {
    res.locals.sidebarDocuments = undefined;
  }

  next();
});

exports.getIndex = (req, res, next) => {
  res.render('user/index');
};

exports.getMyAccount = (req, res, next) => {
  res.render('user/my-account');
};

exports.getUpdateMe = (req, res, next) => {
  res.render('user/update-me');
};

exports.getLogin = (req, res, next) => {
  res.render('user/login', {
    loginToContinue: req.query.continue === 'true',
  });
};

exports.getSignup = (req, res, next) => {
  res.render('user/signup');
};

exports.getSignupSuccess = (req, res, next) => {
  res.render('user/login-signup-success', {
    flashMessages: [
      {
        type: 'Success',
        message:
          'An email with further instructions has been sent. Please check your email.',
      },
    ],
  });
};

exports.getSignupComplete = catchAsync(async (req, res, next) => {
  const hashedToken = cryptography.createHash(req.params.token);
  const unverfiedUser = await UnverifiedUser.findOne({
    token: hashedToken,
  });
  if (!unverfiedUser) {
    return next(
      new AppError(
        'Signup link expired or is invalid! Try with newer link or redo the signup process.',
        400
      )
    );
  }
  const { token } = req.params;
  res.render('user/signup-complete', { token });
});

exports.getForgotPassword = (req, res, next) => {
  res.render('user/forgot-password');
};

exports.getForgotPasswordSuccess = (req, res, next) => {
  res.render('user/login-signup-success', {
    flashMessages: [
      {
        type: 'Success',
        message:
          'If an account was found, we had sent the email for further instructions',
      },
    ],
  });
};

exports.getResetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = cryptography.createHash(req.params.token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Given link is invalid', 400));
  }

  const { token } = req.params;
  res.render('user/reset-password', { token });
});

exports.getLogout = (req, res, next) => {
  res.clearCookie('changeEmailJwt');
  res.clearCookie('jwt');

  if (req.query.redirect) {
    return res.redirect(req.query.redirect);
  }
  return res.redirect('/');
};

exports.getUpdateMyPassword = (req, res, next) => {
  res.render('user/update-my-password');
};

exports.getChangeMyEmail = (req, res, next) => {
  res.render('user/change-my-email');
};
