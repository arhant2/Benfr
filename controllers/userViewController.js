const mongoose = require('mongoose');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const cryptography = require('../utils/crytography');
const User = require('../models/userModel');
const UnverifiedUser = require('../models/unverifiedUserModel');
const Brand = require('../models/brandModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const handlerFactoryUserViews = require('./handlerFactoryUserViews');

const gramsGenerator = require('../utils/gramsGenerator');

const handlerFactoryBrand = handlerFactoryUserViews(Brand, 'brand', 'brands');
const handlerFactoryCategory = handlerFactoryUserViews(
  Category,
  'category',
  'categories'
);
const handlerFactoryProduct = handlerFactoryUserViews(
  Product,
  'product',
  'products'
);

// ===== Generic things ======

exports.setSidebarItems = catchAsync(async (req, res, next) => {
  try {
    const [brands, categories] = await Promise.all([
      Brand.find().sort('-score -productsCount -updatedAt').limit(4),
      Category.find().sort('-score -productsCount -updatedAt').limit(4),
    ]);

    res.locals.sidebarDocuments = { brands, categories };
  } catch (err) {
    res.locals.sidebarDocuments = undefined;
  }

  next();
});

exports.getIndex = (req, res, next) => {
  res.render('user/index');
};

exports.getMyAccount = (req, res, next) => {
  res.render('user/my-account');
};

exports.getUpdateMe = (req, res, next) => {
  res.render('user/update-me');
};

exports.getLogin = (req, res, next) => {
  res.render('user/login', {
    loginToContinue: req.query.continue === 'true',
  });
};

exports.getSignup = (req, res, next) => {
  res.render('user/signup');
};

exports.getSignupSuccess = (req, res, next) => {
  res.render('user/login-signup-success', {
    flashMessages: [
      {
        type: 'Success',
        message:
          'An email with further instructions has been sent. Please check your email.',
      },
    ],
  });
};

exports.getSignupComplete = catchAsync(async (req, res, next) => {
  const hashedToken = cryptography.createHash(req.params.token);
  const unverfiedUser = await UnverifiedUser.findOne({
    token: hashedToken,
  });
  if (!unverfiedUser) {
    return next(
      new AppError(
        'Signup link expired or is invalid! Try with newer link or redo the signup process.',
        400
      )
    );
  }
  const { token } = req.params;
  res.render('user/signup-complete', { token });
});

exports.getForgotPassword = (req, res, next) => {
  res.render('user/forgot-password');
};

exports.getForgotPasswordSuccess = (req, res, next) => {
  res.render('user/login-signup-success', {
    flashMessages: [
      {
        type: 'Success',
        message:
          'If an account was found, we had sent the email for further instructions',
      },
    ],
  });
};

exports.getResetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = cryptography.createHash(req.params.token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Given link is invalid', 400));
  }

  const { token } = req.params;
  res.render('user/reset-password', { token });
});

exports.getLogout = (req, res, next) => {
  res.clearCookie('changeEmailJwt');
  res.clearCookie('jwt');

  if (req.query.redirect) {
    return res.redirect(req.query.redirect);
  }
  return res.redirect('/');
};

exports.getUpdateMyPassword = (req, res, next) => {
  res.render('user/update-my-password');
};

exports.getChangeMyEmail = (req, res, next) => {
  res.render('user/change-my-email');
};

/////////////////////////////////////////////////////////////

//// Brands
exports.getAllBrandsPreMiddleware = (req, res, next) => {
  req.customs.getAll = {
    sortDefault: '-score,-productsCount,-createdAt',
  };
  next();
};

exports.getAllBrands = handlerFactoryBrand.getAll;

//// Categories
exports.getAllCategoriesPreMiddleware = (req, res, next) => {
  req.customs.getAll = {
    sortDefault: '-score,-productsCount,-createdAt',
  };
  next();
};

exports.getAllCategories = handlerFactoryCategory.getAll;

//// Products
exports.getProductsByBrandMiddleware = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError('No page found', 404));
  }
  req.customs.getAll = {
    queryRestrict: {
      'brand.id': req.params.id,
      published: true,
    },
    sortDefault:
      '-review.averageNormalized,-quantitySold,-currentStock,-createdAt',
    limitDefault: 16,
  };
  res.locals.queryType = 'brand';
  res.locals.displayName = req.params.displayName;

  next();
};

exports.getProductsByCategoryMiddleware = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError('No page found', 404));
  }
  req.customs.getAll = {
    queryRestrict: {
      'categories.id': req.params.id,
      published: true,
    },
    sortDefault: '-review.averageNormalized,-quantitySold,-createdAt',
    limitDefault: 16,
  };
  res.locals.categoryIdParam = req.params.id;
  res.locals.queryType = 'category';
  res.locals.displayName = req.params.displayName;

  next();
};

exports.getAllProducts = handlerFactoryProduct.getAll;

exports.getAllProductsBySearch = catchAsync(async (req, res, next) => {
  res.locals.queryType = 'search';
  res.locals.displayName = req.params.searchBy;

  // console.log(req.params.searchBy);

  const limit = req.query.limit * 1 || 10;
  const page = req.query.page * 1 || 1;
  const skip = limit * (page - 1);

  const queryObjParsed = {
    page,
    filter: {},
  };

  if (req.query.limit) {
    queryObjParsed.limit = limit;
  }

  const filterQuery = {};

  if (
    req.query &&
    req.query.currentStock &&
    req.query.currentStock.gt &&
    req.query.currentStock.gt * 1 === 0
  ) {
    filterQuery.currentStock = {
      $gt: 0,
    };
    queryObjParsed.filter.currentStock = {
      gt: 0,
    };
  }

  // console.log(filterQuery);

  // console.log(limit, skip);

  const searchGrams = gramsGenerator.gramsQuery(req.params.searchBy);

  const documents = await Product.aggregate([
    { $match: { $text: { $search: searchGrams } } },
    { $match: { $and: [{ published: true }, filterQuery] } },
    { $sort: { score: { $meta: 'textScore' } } },
    {
      $addFields: {
        score: { $meta: 'textScore' },
      },
    },
    { $skip: skip },
    { $limit: limit },
    { $match: { score: { $gte: 120 } } },
  ]);

  // console.log(documents);

  const addFilter = (str) => {
    if (queryObjParsed.filterStringified) {
      str += `&${queryObjParsed.filterStringified}`;
    }
    return str;
  };

  if (queryObjParsed.page > 1) {
    queryObjParsed.prevLink = addFilter(
      // eslint-disable-next-line prefer-template
      `${req.customs.path}?page=${queryObjParsed.page * 1 - 1}` +
        (queryObjParsed.limit ? `&limit=${queryObjParsed.limit}` : '') +
        (queryObjParsed.sort ? `&sort=${queryObjParsed.sort}` : '')
    );
  }

  if (documents.length >= queryObjParsed.limit) {
    queryObjParsed.nextLink = addFilter(
      // eslint-disable-next-line prefer-template
      `${req.customs.path}?page=${queryObjParsed.page * 1 + 1}` +
        (queryObjParsed.limit ? `&limit=${queryObjParsed.limit}` : '') +
        (queryObjParsed.sort ? `&sort=${queryObjParsed.sort}` : '')
    );
  }

  res.render('user/products', {
    documents,
    queryObjParsed,
  });
});
