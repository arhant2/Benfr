const mongoose = require('mongoose');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel');

const handlerFactory = require('./handlerFactory')(Order, 'order', 'orders');

//////////////////////////////////////////
// Checkout
//////////////////////////////////////////
exports.checkout = catchAsync(async (req, res, next) => {
  // Check if body contains an address
  if (!req.body.address || !mongoose.isValidObjectId(req.body.address)) {
    return next(new AppError('Invalid address, please enter an address'));
  }

  const address = await Address.findOne({
    _id: req.body.address,
    user: req.customs.user.id,
  });
  if (!address) {
    return next(
      new AppError(
        'No address with specified details found associated with current user',
        404
      )
    );
  }

  const cart = req.customs.document;

  // return res.send('Verified');

  const order = await Order.newOrder(req.customs.user, address, cart);

  res.status(201).json({
    status: 'success',
    message: 'Successfully placed the order',
    order,
  });
});

//////////////////////////////////////////
// Next stage
//////////////////////////////////////////
exports.nextStage = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('No order found with given details'));
  }

  await order.nextStage(req.body.currentStage, req.body.products);
});

//////////////////////////////////////////
// For testing
//////////////////////////////////////////
exports.getAll = handlerFactory.getAll;
exports.getOne = handlerFactory.getOne;

//////////////////////////////////////////
// If order exists and user has priviliges to access it
//////////////////////////////////////////
exports.orderExistsAndHavePriviliges = catchAsync(async (req, res, next) => {
  const order =
    req.customs.user.role === 'admin'
      ? await Order.findById(req.params.id)
      : await Order.findOne({ _id: req.params.id, user: req.customs.id });

  if (!order) {
    return next(new AppError('No order with specified details found.', 404));
  }

  req.customs.document = order;
});

//////////////////////////////////////////
// cancel
//////////////////////////////////////////
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = req.customs.document;

  await order.cancel();

  res.status(200).json({
    status: 'success',
    message: 'Cancelled order successfully',
  });
});
