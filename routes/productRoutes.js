const express = require('express');

const authController = require('../controllers/authController');
const productController = require('../controllers/productController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, productController.getAll)
  .post(productController.createOne);

router
  .route('/:id')
  .get(productController.getOne)
  .patch(productController.updateOne)
  .delete(productController.deleteOne);

module.exports = router;
