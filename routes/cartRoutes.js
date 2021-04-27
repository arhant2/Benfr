const express = require('express');
const multer = require('multer');

const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');
const cartFilters = require('../filters/cartFilters');

const upload = multer();
const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    cartController.getCart
  )
  .put(
    authController.protect,
    upload.none(),
    cartFilters.putCart,
    cartController.putCart
  )
  .delete(authController.protect, cartController.deleteCart);

router
  .route('/add')
  .patch(
    authController.protect,
    cartFilters.addToCart,
    cartController.addToCart
  );

module.exports = router;
