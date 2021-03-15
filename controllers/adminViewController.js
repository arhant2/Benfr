const handlerFactoryAdminViews = require('./handlerFactoryAdminViews');
const Brand = require('../models/brandModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');

const handlerFactoryBrand = handlerFactoryAdminViews(Brand, 'brand', 'brands');
const handlerFactoryCategory = handlerFactoryAdminViews(
  Category,
  'category',
  'categories'
);
const handlerFactoryProduct = handlerFactoryAdminViews(
  Product,
  'product',
  'products'
);

// const AppError = require('../utils/AppError');

exports.redirectDashboard = (req, res, next) => {
  res.redirect('/a/dashboard');
};

exports.getDashboard = (req, res, next) => {
  res.render('admin/index');
};

exports.getBrands = handlerFactoryBrand.getAll;
exports.getOneBrand = handlerFactoryBrand.getOne;
exports.getNewBrandForm = handlerFactoryBrand.getNewForm;

exports.getCategories = handlerFactoryCategory.getAll;
exports.getOneCategory = handlerFactoryCategory.getOne;
exports.getNewCategoryForm = handlerFactoryCategory.getNewForm;

exports.getProducts = handlerFactoryProduct.getAll;
exports.getOneProduct = catchAsync(async (req, res, next) => {
  [res.locals.brands, res.locals.categories] = await Promise.all([
    Brand.find().select('name').sort('name'),
    Category.find().select('name').sort('name'),
  ]);
  await handlerFactoryProduct.getOne(req, res, next);
});

exports.getNewProductForm = catchAsync(async (req, res, next) => {
  [res.locals.brands, res.locals.categories] = await Promise.all([
    Brand.find().select('name').sort('name'),
    Category.find().select('name').sort('name'),
  ]);

  await handlerFactoryProduct.getNewForm(req, res, next);
});
