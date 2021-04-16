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
  '/:id/next',
  authController.protect,
  authController.restrictTo('admin'),
  upload.none(),
  orderFilters.nextStage,
  orderController.nextStage
);

router.delete(
  '/:id/cancel',
  authController.protect,
  orderController.orderExistsAndHavePriviliges,
  upload.none(),
  orderFilters.cancelOrder,
  orderController.cancelOrder
);

router.get(
  '/:id/invoice',
  authController.protect,
  orderController.orderExistsAndHavePriviliges,
  orderController.getInvoice
);

module.exports = router;
