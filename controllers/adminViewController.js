const handlerFactoryAdminViews = require('./handlerFactoryAdminViews');
const Brand = require('../models/brandModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

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
const handlerFactoryOrder = handlerFactoryAdminViews(Order, 'order', 'orders');

// const AppError = require('../utils/AppError');

exports.redirectDashboard = (req, res, next) => {
  res.redirect('/a/dashboard');
};

exports.getDashboard = (req, res, next) => {
  res.render('admin/index');
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Brands
exports.getBrands = handlerFactoryBrand.getAll;
exports.getOneBrand = handlerFactoryBrand.getOne;
exports.getNewBrandForm = handlerFactoryBrand.getNewForm;

///////////////////////////////////////////////////////////////////////////////////////////////////
// Categories
exports.getCategories = handlerFactoryCategory.getAll;
exports.getOneCategory = handlerFactoryCategory.getOne;
exports.getNewCategoryForm = handlerFactoryCategory.getNewForm;

///////////////////////////////////////////////////////////////////////////////////////////////////
// Products
exports.getProducts = handlerFactoryProduct.getAll;

exports.attachBrandsAndCategoriesToProductsForm = catchAsync(
  async (req, res, next) => {
    [res.locals.brands, res.locals.categories] = await Promise.all([
      Brand.find().select('name').sort('name'),
      Category.find().select('name').sort('name'),
    ]);
    next();
  }
);

exports.getOneProduct = handlerFactoryProduct.getOne;
exports.getNewProductForm = handlerFactoryProduct.getNewForm;

///////////////////////////////////////////////////////////////////////////////////////////////////
// Orders
exports.getOrders = handlerFactoryOrder.getAll;

exports.getOneOrderMiddleware = catchAsync(async (req, res, next) => {
  const document = await Order.findById(req.params.id).populate('user');
  if (!document) {
    return next(new AppError('No order found with with that ID', 404));
  }
  req.customs.document = document;

  next();
});

exports.getOneOrder = handlerFactoryOrder.getOne;
