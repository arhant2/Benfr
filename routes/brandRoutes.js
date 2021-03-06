const express = require('express');

// const authController = require('../controllers/authController');
const brandController = require('../controllers/brandController');
const brandFilters = require('../filters/brandFilters');

const router = express.Router();

router
  .route('/')
  .get(brandController.getAll)
  .post(
    brandController.uploadFiles,
    brandController.uploadFilesCloudinary,
    brandFilters.createOne,
    brandController.createOne
  );

router
  .route('/:id')
  .get(brandController.getOne)
  .patch(
    brandController.uploadFiles,
    brandController.uploadFilesCloudinary,
    brandFilters.updateOne,
    brandController.updateOne
  )
  .delete(brandController.deleteOne);

module.exports = router;
