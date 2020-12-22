const express = require('express');

// const authController = require('../controllers/authController');
const brandController = require('../controllers/brandController');

const router = express.Router();

router.route('/').get(brandController.getAll).post(brandController.createOne);

router
  .route('/:id')
  .get(brandController.getOne)
  .patch(brandController.updateOne)
  .delete(brandController.deleteOne);

module.exports = router;
