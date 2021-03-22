const catchAsync = require('../utils/catchAsync');
const gramsGenerator = require('../utils/gramsGenerator');

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

exports.productSearch = catchAsync(async (req, res, next) => {
  const query = gramsGenerator.gramsQuery(req.params.searchBy);

  const limit = req.query.limit * 1 || 10;
  const page = req.query.page * 1 || 1;
  const skip = limit * (page - 1);

  console.log(limit, skip);

  const products = await Product.aggregate([
    { $match: { $text: { $search: query } } },
    { $sort: { score: { $meta: 'textScore' } } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        score: { $meta: 'textScore' },
        name: 1,
        nameNormalized: 1,
        review: 1,
        createdAt: 1,
        price: 1,
        discountedPrice: 1,
        images: 1,
      },
    },
    { $match: { score: { $gte: 120 } } },
  ]);

  res.status(200).json({
    products,
    query,
  });
});

exports.getAll = handlerFactory.getAll;
exports.getOne = handlerFactory.getOne;
exports.createOne = handlerFactory.createOne;
exports.updateOne = handlerFactory.updateOneUsingSave;
exports.deleteOne = handlerFactory.deleteOne;
