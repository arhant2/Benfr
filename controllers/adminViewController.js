const handlerFactory = require('./handlerFactoryAdminViews');
const Brand = require('../models/brandModel');

const handlerFactoryBrand = handlerFactory(Brand, 'brand', 'brands');

// const AppError = require('../utils/AppError');

exports.redirectDashboard = (req, res, next) => {
  res.redirect('/a/dashboard');
};

exports.getDashboard = (req, res, next) => {
  res.render('admin/index');
};

exports.getBrands = handlerFactoryBrand.getAll();
