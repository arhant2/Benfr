const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModel');

exports.getWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.customs.user.id });

  if (!wishlist) {
    return next(new AppError('No wishlist with the current user'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      wishlist,
    },
  });
});

exports.addProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.params.id,
    published: true,
  });

  if (!product) {
    return next(new AppError('No product with the ID found', 404));
  }

  const wishlist =
    (await Wishlist.findOne({ user: req.customs.user.id })) ||
    new Wishlist({
      user: req.customs.user.id,
    });

  await wishlist.addProduct(product);
  await wishlist.save();

  res.status(200).json({
    status: 'success',
    message: 'Added product to wishlist successfully',
  });
});

exports.removeProduct = catchAsync(async (req, res, next) => {
  await Wishlist.findOneAndUpdate(
    { user: req.customs.user.id },
    {
      $pull: {
        products: { productId: req.params.id },
      },
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Removed product from wishlist successfully',
  });
});
