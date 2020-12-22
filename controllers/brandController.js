const Brand = require('../models/brandModel');

const handlerFactory = require('./handlerFactory')(Brand, 'brand', 'brands');

// Object.assign(exports, handlerFactory);

exports.getAll = handlerFactory.getAll;
exports.getOne = handlerFactory.getOne;
exports.createOne = handlerFactory.createOne;
exports.updateOne = handlerFactory.updateOneUsingSave;
exports.deleteOne = handlerFactory.deleteOne;
