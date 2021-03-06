const Product = require('../models/productModel');

const handlerFactory = require('./handlerFactory')(
  Product,
  'product',
  'products'
);

const { upload, uploadFilesCloudinaryMiddlware } = require('../cloudinary');

exports.uploadFiles = upload.fields([
  { name: 'image0', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
]);
exports.uploadFilesCloudinary = uploadFilesCloudinaryMiddlware(
  'benfr/products'
);

// Object.assign(exports, handlerFactory);

exports.getAll = handlerFactory.getAll;
exports.getOne = handlerFactory.getOne;
exports.createOne = handlerFactory.createOne;
exports.updateOne = handlerFactory.updateOneUsingSave;
exports.deleteOne = handlerFactory.deleteOne;
