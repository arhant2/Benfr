const express = require('express');

const authController = require('../controllers/authController');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.get('/', orderController.getAll);
router.get('/:id', orderController.getOne);

router.post(
  '/checkout',
  authController.protect,
  authController.restrictTo('user'),
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
