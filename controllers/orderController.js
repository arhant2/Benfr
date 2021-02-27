const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/AppError');
const Product = require('../models/productModel');

exports.verifyCartMiddleware = catchAsync(async (req, res, next) => {
  req.customs.verifyCart = {
    changed: false,
  };
  if (
    !req.body.products ||
    !Array.isArray(req.body.products) ||
    req.body.products.length === 0
  ) {
    req.customs.verifyCart.changed = true;
    req.req.body.products = [];
    return next();
  }
  const taken = {};
  req.body.products.forEach((product) => {
    if (
      !(typeof product === 'object') ||
      !mongoose.isValidObjectId(product.id) ||
      !taken[product.id] ||
      typeof product.name !== 'string' ||
      typeof product !== 'number' ||
      product.price <= 0 ||
      !Number.isInteger(Number(product.quantity)) ||
      product.quantity < 1
    ) {
      req.customs.verifyCart.changed = true;
      req.body.products = [];
      return next();
    }
    taken[product.id] = true;
  });
  const productsDB = await Product.find({
    _id: {
      $in: req.body.products.map((el) => el.id),
    },
  });
  const index = {};
  productsDB.forEach((product, i) => {
    index[product.id] = i;
  });
  const finalProducts = [];
  let message = '';
  req.body.products.forEach((product) => {
    if (!index[product.id]) {
      req.customs.verifyCart.changed = true;
      message += `${product.name} is no more available\n`;
      return;
    }
    const productDB = productsDB[index[product.id]];
    if (product.name !== productDB.name) {
      req.customs.verifyCart.changed = true;
      product.name = productDB.name;
    }
    if (product.price !== productDB.price) {
      req.customs.verifyCart.changed = true;
      message += `Price of ${product.name} changed from ${product.price} to ${productDB.price}\n`;
      product.price = productDB.price;
    }
    finalProducts.push(product);
  });
  req.body.products = finalProducts;
  req.customs.verifyCart.message = message;
  next();
});
