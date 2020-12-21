const Product = require('../models/productModel');

const handlerFactory = require('./handlerFactory')(
  Product,
  'product',
  'products'
);

Object.assign(exports, handlerFactory);

// exports.getAll = handlerFactory.getAll;
// exports.getOne = handlerFactory.getOne;
// exports.createOne = handlerFactory.createOne;
// exports.updateOne = handlerFactory.updateOne;
// exports.deleteOne = handlerFactory.deleteOne;
