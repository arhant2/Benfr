const express = require('express');

const authController = require('../controllers/authController');
const addressController = require('../controllers/addressController');
const userViewController = require('../controllers/userViewController');
const cartController = require('../controllers/cartController');

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
All routes below will check if logged so to make changes in navbar, also setsidebarItems
===================================== */

router.get(
  '/',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  userViewController.getIndex
);

router.get(
  '/myAccount',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  authController.protectView,
  userViewController.getMyAccount
);

router.get(
  '/updateMe',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  authController.protectView,
  userViewController.getUpdateMe
);

router.get(
  '/updateMyPassword',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  authController.protectView,
  userViewController.getUpdateMyPassword
);

router.get(
  '/changeMyEmail',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  authController.protectView,
  userViewController.getChangeMyEmail
);

///////////////////////////////////////////////

//// Brands
router.get(
  '/brands',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  userViewController.getAllBrandsPreMiddleware,
  userViewController.getAllBrands
);

//// Categories
router.get(
  '/categories',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  userViewController.getAllCategoriesPreMiddleware,
  userViewController.getAllCategories
);

//// Products
router.get(
  '/products/brands/:displayName?/:id',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  userViewController.getProductsByBrandMiddleware,
  userViewController.getAllProducts
);

router.get(
  '/products/categories/:displayName?/:id',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  userViewController.getProductsByCategoryMiddleware,
  userViewController.getAllProducts
);

router.get(
  '/products/search/:searchBy',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  userViewController.getAllProductsBySearch
);

router.get(
  '/products/:name?/:id',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  userViewController.getOneProduct
);

//// Addresses
router.get(
  '/addresses',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  authController.protectView,
  userViewController.getAllAddressesMiddleware,
  userViewController.getAllAddresses
);

router.get(
  '/addresses/new',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  authController.protectView,
  userViewController.addLocationDetails,
  userViewController.getNewAddressForm
);

router.get(
  '/addresses/:id',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  authController.protectView,
  addressController.checkIfAddressBelongsTouser,
  userViewController.addLocationDetails,
  userViewController.getOneAddress
);

//// Reviews
router.get(
  '/products/:name?/:productId/reviews',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  userViewController.getAllReviewsMiddleware,
  userViewController.getAllReviews
);

//// Cart
router.get(
  '/cart',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  authController.protectView,
  userViewController.getCart
);

//// Checkout
router.get(
  '/checkout/address',
  authController.isLoggedIn,
  authController.protectView,
  userViewController.getCheckoutSelectAddress
);

router.get(
  '/checkout/address/new',
  authController.isLoggedIn,
  authController.protectView,
  userViewController.addLocationDetails,
  userViewController.getCheckoutNewAddress
);

router.get(
  '/checkout/:id',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  authController.protectView,
  addressController.checkIfAddressBelongsTouser,
  userViewController.getCheckoutMiddlewareChangeDocumentToAddressAndAttach,
  cartController.verifyAndAttachCartBeforeCheckout,
  userViewController.getCheckout
);

const catchAsync = require('../utils/catchAsync');
const Order = require('../models/orderModel');

//// Orders
router.get(
  '/orders/:id',
  userViewController.setSidebarItems,
  authController.isLoggedIn,
  catchAsync(async (req, res, next) => {
    const document = await Order.findById(req.params.id);
    res.render('user/order-one', {
      document: document,
    });
  })
);

module.exports = router;
