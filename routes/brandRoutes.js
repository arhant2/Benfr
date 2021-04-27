const express = require('express');

const authController = require('../controllers/authController');
const brandController = require('../controllers/brandController');
const brandFilters = require('../filters/brandFilters');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    brandController.getAll
  )
  .post(
    brandController.uploadFiles,
    brandController.uploadFilesCloudinary,
    brandFilters.createOne,
    brandController.createOne
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    brandController.getOne
  )
  .patch(
    brandController.uploadFiles,
    brandController.uploadFilesCloudinary,
    brandFilters.updateOne,
    brandController.updateOne
  )
  .delete(brandController.deleteOne);

module.exports = router;
