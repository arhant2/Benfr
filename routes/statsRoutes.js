const express = require('express');

const authController = require('../controllers/authController');
const statsController = require('../controllers/statsController');

const router = express.Router();

router.get(
  '/',
  authController.protect,
  authController.restrictTo('admin'),
  statsController.attachStats,
  statsController.getStats
);

module.exports = router;
