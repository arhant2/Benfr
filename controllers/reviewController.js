const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');

exports.createReview = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new AppError(400, "Product doesn't exits"));
  }

  const { user } = req.customs;

  const obj = {
    ...req.body,
    product: product.id,
    user: user.id,
  };

  const review = await Review.create(obj);

  res.status(201).json({
    status: 'success',
    message: 'Successfully created review',
    data: {
      review,
    },
  });
});
