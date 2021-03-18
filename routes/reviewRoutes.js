const express = require('express');

const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const reviewFilters = require('../filters/reviewFilters');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAll)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewFilters.createOne,
    reviewController.productExits,
    reviewController.attachProductAndUserIdForCreateOne,
    reviewController.createOne
  );

router
  .route('/:id')
  .patch(
    authController.protect,
    authController.restrictTo('user'),
    reviewFilters.updateOne,
    reviewController.checkIfReviewBelongsToUser,
    reviewController.updateOne
  )
  .delete(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.checkIfReviewBelongsToUser,
    reviewController.deleteOne
  );

router.post(
  '/:id/like',
  authController.protect,
  authController.restrictTo('user'),
  reviewFilters.likeReview,
  reviewController.likeReview
);

router.delete(
  '/:id/like/undo',
  authController.protect,
  authController.restrictTo('user'),
  reviewFilters.unlikeReview,
  reviewController.unlikeReview
);

router.post(
  '/:id/mark',
  authController.protect,
  authController.restrictTo('user'),
  reviewFilters.markReview,
  reviewController.markReview
);

router.delete(
  '/:id/mark/undo',
  authController.protect,
  authController.restrictTo('user'),
  reviewFilters.unmarkReview,
  reviewController.unmarkReview
);

module.exports = router;
