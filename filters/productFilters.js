const filterBodyMiddleware = require('../utils/filterBodyMiddleware');

exports.createOne = filterBodyMiddleware([
  'name',
  'brand',
  'categories',
  'price',
  'discountedPrice',
  'specifications',
  'published',
  'currentStock',
  'maxPerOrder',
]);

exports.updateOne = filterBodyMiddleware([
  'name',
  'brand',
  'categories',
  'price',
  'discountedPrice',
  'specifications',
  'published',
  'currentStock',
  'maxPerOrder',
  'deleteImage0',
  'deleteImage1',
  'deleteImage2',
  'deleteImage3',
]);
