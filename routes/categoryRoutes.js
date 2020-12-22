const express = require('express');

// const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

router
  .route('/')
  .get(categoryController.getAll)
  .post(categoryController.createOne);

router
  .route('/:id')
  .get(categoryController.getOne)
  .patch(categoryController.updateOne)
  .delete(categoryController.deleteOne);

module.exports = router;
