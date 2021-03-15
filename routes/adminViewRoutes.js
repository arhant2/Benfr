const express = require('express');
const qs = require('qs');

const dateFormator = require('../utils/dateFormator');

const adminViewController = require('../controllers/adminViewController');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.helpers = {
    dateFormator,
    qs,
  };
  next();
});

router.get('/', adminViewController.redirectDashboard);
router.get('/dashboard', adminViewController.getDashboard);

router.get('/brands', adminViewController.getBrands);
router.get('/brands/new', adminViewController.getNewBrandForm);
router.get('/brands/:name?/:id', adminViewController.getOneBrand);
// router.get('/brands/:id', adminViewController.getOneBrand);

router.get('/categories', adminViewController.getCategories);
router.get('/categories/new', adminViewController.getNewCategoryForm);
router.get('/categories/:name?/:id', adminViewController.getOneCategory);

router.get('/products', adminViewController.getProducts);
router.get('/products/new', adminViewController.getNewProductForm);
router.get('/products/:name?/:id', adminViewController.getOneProduct);

module.exports = router;
