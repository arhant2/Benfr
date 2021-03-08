const express = require('express');
const dateFormator = require('../utils/dateFormator');

const adminViewController = require('../controllers/adminViewController');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.dateFormator = dateFormator;
  next();
});

router.get('/', adminViewController.redirectDashboard);

router.get('/dashboard', adminViewController.getDashboard);

router.get('/brands', adminViewController.getBrands);

module.exports = router;
