const Brand = require('../models/brandModel');

const handlerFactory = require('./handlerFactory')(Brand, 'brand', 'brands');
const { upload, uploadFilesCloudinaryMiddlware } = require('../cloudinary');

exports.uploadFiles = upload.fields([{ name: 'image0', maxCount: 1 }]);
exports.uploadFilesCloudinary = uploadFilesCloudinaryMiddlware('benfr/brands');

exports.createOne = handlerFactory.createOne;
exports.getAll = handlerFactory.getAll;
exports.getOne = handlerFactory.getOne;
exports.createOne = handlerFactory.createOne;
exports.updateOne = handlerFactory.updateOneUsingSave;
exports.deleteOne = handlerFactory.deleteOne;
