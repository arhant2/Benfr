const express = require('express');

const authController = require('../controllers/authController');
const wishlistController = require('../controllers/wishlistController');

const router = express.Router();

router.get('/', authController.protect, wishlistController.getWishlist);

router.post('/add/:id', authController.protect, wishlistController.addProduct);

router.delete(
  '/remove/:id',
  authController.protect,
  wishlistController.removeProduct
);

module.exports = router;
