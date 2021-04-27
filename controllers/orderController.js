const mongoose = require('mongoose');

const sanitizeOutputDataToIncludeOnlyIds = require('../utils/sanitizeOutputDataToIncludeOnlyIds');
const getBaseUrl = require('../utils/getBaseUrl');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Order = require('../models/orderModel');
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

  const order = await Order.newOrder(
    req.customs.user,
    address,
    cart,
    getBaseUrl(req)
  );

  res.status(201).json({
    status: 'success',
    message: 'Successfully placed the order',
    data: {
      order: sanitizeOutputDataToIncludeOnlyIds(order),
    },
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

  await order.nextStage(
    req.body.currentStage,
    req.body.products,
    getBaseUrl(req)
  );

  res.status(200).json({
    status: 'success',
    data: {
      order: sanitizeOutputDataToIncludeOnlyIds(order),
    },
  });
});

//////////////////////////////////////////
// If order exists and user/admin has priviliges to access/modify it
//////////////////////////////////////////
exports.orderExistsAndHavePriviliges = catchAsync(async (req, res, next) => {
  const order = await (req.customs.user.role === 'admin'
    ? Order.findById(req.params.id)
    : Order.findOne({ _id: req.params.id, user: req.customs.user.id }));

  if (!order) {
    return next(new AppError('No order with specified details found.', 404));
  }

  req.customs.document = order;
  next();
});

//////////////////////////////////////////
// Cancel Order
//////////////////////////////////////////
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = req.customs.document;

  await order.cancelOrder(req.customs.user, req.body.reason, getBaseUrl(req));

  res.status(200).json({
    status: 'success',
    message: 'Cancelled order successfully',
    document: {
      order: sanitizeOutputDataToIncludeOnlyIds(order),
    },
  });
});

//////////////////////////////////////////
// Check if order belongs to user
//////////////////////////////////////////
exports.checkIfOrderBelongsTouser = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.customs.user.id,
  });
  if (!order) {
    return next(
      new AppError(
        'No order with specified details found associated with current user',
        404
      )
    );
  }
  req.customs.document = order;
  next();
});

exports.getInvoice = catchAsync(async (req, res, next) => {
  const order = req.customs.document;

  const baseUrl = `${req.protocol}://${req.get('host')}`;

  const pdf = await order.pdfInvoice(baseUrl);

  res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length });

  res.status(200).send(pdf);
});

//////////////////////////////////////////
// Getting
//////////////////////////////////////////
exports.getAll = handlerFactory.getAll;
exports.getOne = handlerFactory.getOne;
