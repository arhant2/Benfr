const Address = require('../models/addressModel');

const handlerFactory = require('./handlerFactory')(
  Address,
  'address',
  'address'
);

exports.getAll = handlerFactory.getAll;
exports.getOne = handlerFactory.getOne;
exports.createOne = handlerFactory.createOne;
exports.updateOne = handlerFactory.updateOneUsingSave;
exports.deleteOne = handlerFactory.deleteOne;
