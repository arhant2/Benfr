const express = require('express');

// const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const productFilters = require('../filters/productFilters');

const router = express.Router();

router
  .route('/')
  .get(productController.getAll)
  .post(
    productController.uploadFiles,
    productController.uploadFilesCloudinary,
    productFilters.createOne,
    productController.createOne
  );

router
  .route('/:id')
  .get(productController.getOne)
  .patch(
    productController.uploadFiles,
    productController.uploadFilesCloudinary,
    productFilters.updateOne,
    productController.updateOne
  )
  .delete(productController.deleteOne);

module.exports = router;
