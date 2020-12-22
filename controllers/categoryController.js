const Category = require('../models/categoryModel');

const handlerFactory = require('./handlerFactory')(
  Category,
  'category',
  'categories'
);

// Object.assign(exports, handlerFactory);

exports.getAll = handlerFactory.getAll;
exports.getOne = handlerFactory.getOne;
exports.createOne = handlerFactory.createOne;
exports.updateOne = handlerFactory.updateOneUsingSave;
exports.deleteOne = handlerFactory.deleteOne;
