const express = require('express');

const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');
const categoryFilters = require('../filters/categoryFilter');

const router = express.Router();

router
  .route('/')
  .get(categoryController.getAll)
  .post(
    categoryController.uploadFiles,
    categoryController.uploadFilesCloudinary,
    categoryFilters.createOne,
    categoryController.createOne
  );

router
  .route('/:id')
  .get(categoryController.getOne)
  .patch(
    categoryController.uploadFiles,
    categoryController.uploadFilesCloudinary,
    categoryFilters.updateOne,
    categoryController.updateOne
  )
  .delete(categoryController.deleteOne);

module.exports = router;
