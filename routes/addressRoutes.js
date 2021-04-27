const express = require('express');
const multer = require('multer');

const authController = require('../controllers/authController');
const addressController = require('../controllers/addressController');
const addressFilter = require('../filters/addressFilter');

const upload = multer();
const router = express.Router();

router.route('/locations').get(addressController.getAllLocations);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    addressController.getAllMiddleware,
    addressController.getAll
  )
  .post(
    authController.protect,
    upload.none(),
    addressFilter.createOne,
    addressController.attachUserForCreateOne,
    addressController.createOne
  );

router
  .route('/:id')
  .patch(
    authController.protect,
    upload.none(),
    addressFilter.updateOne,
    addressController.checkIfAddressBelongsTouser,
    addressController.updateOne
  )
  .delete(
    authController.protect,
    addressController.checkIfAddressBelongsTouser,
    addressController.deleteOne
  );

module.exports = router;
