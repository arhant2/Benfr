const express = require('express');

const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');
const cartFilters = require('../filters/cartFilters');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, cartController.getCart)
  .put(authController.protect, cartFilters.putCart, cartController.putCart)
  .delete(authController.protect, cartController.deleteCart);

router
  .route('/add')
  .patch(
    authController.protect,
    cartFilters.addToCart,
    cartController.addToCart
  );

module.exports = router;
