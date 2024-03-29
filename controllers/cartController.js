const mongoose = require('mongoose');

const sanitizeOutputDataToIncludeOnlyIds = require('../utils/sanitizeOutputDataToIncludeOnlyIds');
const catchAsync = require('../utils/catchAsync');
const Cart = require('../models/cartModel');
const AppError = require('../utils/AppError');

//////////////////////////////////////////
////// Get Cart
exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.customs.user.id });

  if (!cart) {
    return next(new AppError('No cart found with current user', 404));
  }

  await cart.verifyCart();
  await cart.save();

  res.status(200).json({
    status: 'success',
    cart: sanitizeOutputDataToIncludeOnlyIds(cart),
  });
});

//////////////////////////////////////////
//// Delete cart
exports.deleteCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOneAndDelete({ user: req.customs.user.id });

  if (!cart) {
    return next(new AppError('No cart found with current user', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Deleted cart successfully',
  });
});

//////////////////////////////////////////
///// Add an item
exports.addToCart = catchAsync(async (req, res, next) => {
  if (!req.body.product || !mongoose.isValidObjectId(req.body.product)) {
    return next(new AppError('Invalid product', 400));
  }

  let cart = await Cart.findOne({ user: req.customs.user.id });

  if (!cart) {
    cart = await Cart.create({ user: req.customs.user.id });
  }

  await cart.verifyCart();

  await cart.addToCart(req.body.product);

  // console.log(cart);

  await cart.save();

  // console.log(cart.products[0].product);

  res.status(200).json({
    status: 'success',
    message: 'Item added to cart successfully',
  });
});

//////////////////////////////////////////
//// Put cart
exports.putCart = catchAsync(async (req, res, next) => {
  if (!req.body.products) {
    req.body.products = [];
  }

  let cart = await Cart.findOne({ user: req.customs.user.id });

  if (!cart) {
    cart = await Cart.create({ user: req.customs.user.id });
  }

  if (!cart) {
    return next(new AppError('Internal server error', 500));
  }

  await cart.createCart(req.body.products);

  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Put cart successful',
  });
});

//////////////////////////////////////////
//// Verify cart before checkout
exports.verifyAndAttachCartBeforeCheckout = catchAsync(
  async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.customs.user.id });

    if (!cart) {
      return next(
        new AppError('There must be some items with which you checkout', 400)
      );
    }

    cart.verifyCartBeforeCheckout();

    req.customs.document = cart;

    next();
  }
);

//////////////////////////////////////////
//// Verify cart for checkout
exports.verifyAndAttachForCheckout = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.customs.user.id });

  if (!cart) {
    return next(
      new AppError('There must be some items with which you checkout', 400)
    );
  }

  await cart.verifyCartForCheckout(req.body.products);

  req.customs.document = cart;

  next();
});
