const express = require('express');
// const qs = require('qs');

// const dateFormator = require('../utils/dateFormator');

const authController = require('../controllers/authController');
const adminViewController = require('../controllers/adminViewController');
const statsController = require('../controllers/statsController');

const router = express.Router();

router.use(
  authController.isLoggedIn,
  authController.protectView,
  authController.restrictTo('admin')
);

router.get('/', adminViewController.redirectDashboard);
router.get(
  '/dashboard',
  statsController.attachStats,
  adminViewController.getDashboard
);

///////////////////////////////////////////////////////////////////////////////////////////////////
// Brands
router.get('/brands', adminViewController.getBrands);
router.get('/brands/new', adminViewController.getNewBrandForm);
router.get('/brands/:name?/:id', adminViewController.getOneBrand);

///////////////////////////////////////////////////////////////////////////////////////////////////
// Categories
router.get('/categories', adminViewController.getCategories);
router.get('/categories/new', adminViewController.getNewCategoryForm);
router.get('/categories/:name?/:id', adminViewController.getOneCategory);

///////////////////////////////////////////////////////////////////////////////////////////////////
// Products
router.get('/products', adminViewController.getProducts);
router.get(
  '/products/new',
  adminViewController.attachBrandsAndCategoriesToProductsForm,
  adminViewController.getNewProductForm
);
router.get(
  '/products/:name?/:id',
  adminViewController.attachBrandsAndCategoriesToProductsForm,
  adminViewController.getOneProduct
);

///////////////////////////////////////////////////////////////////////////////////////////////////
// Orders
router.get('/orders', adminViewController.getOrders);

router.get(
  '/orders/:id',
  adminViewController.getOneOrderMiddleware,
  adminViewController.getOneOrder
);

///////////////////////////////////////////////////////////////////////////////////////////////////
// Users
router.get(
  '/users',
  adminViewController.getUsersMiddleware,
  adminViewController.getUsers
);

router.get(
  '/users/:id',
  adminViewController.getOneUserMiddleware,
  adminViewController.getOneUser
);

module.exports = router;
