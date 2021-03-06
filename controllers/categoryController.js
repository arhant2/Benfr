const Category = require('../models/categoryModel');

const handlerFactory = require('./handlerFactory')(
  Category,
  'category',
  'categories'
);

const { upload, uploadFilesCloudinaryMiddlware } = require('../cloudinary');

exports.uploadFiles = upload.fields([{ name: 'image0', maxCount: 1 }]);
exports.uploadFilesCloudinary = uploadFilesCloudinaryMiddlware(
  'benfr/categories'
);

// Object.assign(exports, handlerFactory);

exports.getAll = handlerFactory.getAll;
exports.getOne = handlerFactory.getOne;
exports.createOne = handlerFactory.createOne;
exports.updateOne = handlerFactory.updateOneUsingSave;
exports.deleteOne = handlerFactory.deleteOne;
