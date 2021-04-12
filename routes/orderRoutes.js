const express = require('express');
const multer = require('multer');

const authController = require('../controllers/authController');
const orderController = require('../controllers/orderController');
const cartController = require('../controllers/cartController');
const orderFilters = require('../filters/orderFilters');

const upload = multer();

const router = express.Router();

router.get('/', orderController.getAll);
router.get('/:id', orderController.getOne);

router.post(
  '/checkout',
  authController.protect,
  authController.restrictTo('user'),
  upload.none(),
  orderFilters.checkout,
  cartController.verifyAndAttachForCheckout,
  orderController.checkout
);

router.patch(
  '/next',
  authController.protect,
  authController.restrictTo('admin'),
  orderController.nextStage
);

router.delete(
  '/cancel',
  authController.protect,
  orderController.orderExistsAndHavePriviliges,
  orderController.cancelOrder
);

module.exports = router;
