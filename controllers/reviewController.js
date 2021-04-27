const sanitizeOutputDataToIncludeOnlyIds = require('../utils/sanitizeOutputDataToIncludeOnlyIds');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const getBaseUrl = require('../utils/getBaseUrl');

const handlerFactory = require('./handlerFactory')(Review, 'review', 'reviews');

exports.productExits = catchAsync(async (req, res, next) => {
  if (
    !(await Product.exists({
      _id: req.params.productId,
      published: true,
    }))
  ) {
    return next(new AppError("Product doesn't exits", 400));
  }
  next();
});

exports.attachProductAndUserIdForCreateOne = (req, res, next) => {
  req.body.product = req.params.productId;
  req.body.user = req.customs.user.id;
  next();
};

exports.checkIfReviewBelongsToUser = catchAsync(async (req, res, next) => {
  const review = await Review.findOne({
    _id: req.params.id,
    user: req.customs.user.id,
  });

  if (!review) {
    return next(
      new AppError(
        'No review with specified details found associated with current user',
        404
      )
    );
  }

  req.customs.document = review;

  next();
});

exports.getAll = handlerFactory.getAll;
exports.createOne = handlerFactory.createOne;
exports.updateOne = handlerFactory.updateOneUsingSave;
exports.deleteOne = handlerFactory.deleteOne;

const likeMarkReview = (like = true, undo = false) =>
  catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(400).json({
        status: 'success',
        message: 'No review found with that ID',
      });
    }

    review.baseUrlForEmail = getBaseUrl(req);

    const arrName = like ? 'likes' : 'marked';
    const lengthName = like ? 'likesCount' : 'markedCount';
    const idx = review[arrName].indexOf(req.customs.user.id);

    if (undo && idx !== -1) {
      review[arrName].splice(idx, 1);
      review[lengthName] -= 1;
      await review.save();
    } else if (!undo && idx === -1) {
      review[arrName].push(req.customs.user.id);
      review[lengthName] += 1;
      await review.save();
    }

    res.status(200).json({
      status: 'success',
      message: `${undo ? 'Un' : ''}${
        like ? 'Liked' : 'Marked'
      } the review successfully!`,
      data: {
        review: sanitizeOutputDataToIncludeOnlyIds(review),
      },
    });
  });

exports.likeReview = likeMarkReview(true, false);
exports.unlikeReview = likeMarkReview(true, true);
exports.markReview = likeMarkReview(false, false);
exports.unmarkReview = likeMarkReview(false, true);

exports.getReviews = handlerFactory.getAll;
