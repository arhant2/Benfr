const mongoose = require('mongoose');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const cryptography = require('../utils/crytography');
const User = require('../models/userModel');
const UnverifiedUser = require('../models/unverifiedUserModel');
const Brand = require('../models/brandModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Address = require('../models/addressModel');
const Cart = require('../models/cartModel');
const Review = require('../models/reviewModel');
const Order = require('../models/orderModel');
const Wishlist = require('../models/wishlistModel');
const handlerFactoryUserViews = require('./handlerFactoryUserViews');

const gramsGenerator = require('../utils/gramsGenerator');
const { locationDetails } = require('../utils/locationDetails');

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
const handlerFactoryAddress = handlerFactoryUserViews(
  Address,
  'address',
  'addresses'
);
const handlerFactoryReview = handlerFactoryUserViews(
  Review,
  'review',
  'reviews'
);
const handlerFactoryOrder = handlerFactoryUserViews(Order, 'order', 'orders');

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

exports.setFeaturedCategories = catchAsync(async (req, res, next) => {
  const category1 = await Category.findOne({
    images: {
      $exists: true,
      $type: 'array',
      $ne: [],
    },
  }).sort({
    productsCount: -1,
    createdAt: -1,
  });

  if (!category1) {
    return next();
  }

  const [category0, category2] = await Category.find({
    _id: {
      $ne: category1.id,
    },
    images: {
      $exists: true,
      $type: 'array',
      $ne: [],
    },
  }).sort({
    score: -1,
    productsCount: -1,
    createdAt: -1,
  });

  if (!category0 || !category2) {
    return next();
  }

  res.locals.featuredCategories = [
    {
      type: 'Featured',
      category: category0,
    },
    {
      type: 'Colossal',
      category: category1,
    },
    {
      type: 'Featured',
      category: category2,
    },
  ];

  next();
});

exports.setProducts = (name, sortBy, limit) => {
  return catchAsync(async (req, res, next) => {
    res.locals[name] = await Product.find({
      published: true,
      currentStock: { $gt: 0 },
    })
      .sort(sortBy)
      .limit(limit);
    next();
  });
};

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

  let documents = await Product.aggregate([
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

  documents = documents.map((document) => Product.hydrate(document));

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

// exports.getOneProduct = handlerFactoryProduct.getOne;
exports.getOneProduct = catchAsync(async (req, res, next) => {
  const document = await Product.findOne({
    _id: req.params.id,
    published: true,
  });

  if (!document) {
    return next(new AppError('No product found with with that ID', 404));
  }

  let reviewCurrent;
  let reviews;

  // console.log(req.customs);

  if (req.customs.user) {
    [reviewCurrent, reviews] = await Promise.all([
      Review.findOne({ user: req.customs.user.id, product: document.id }),
      Review.find({
        user: { $ne: req.customs.user.id },
        marked: { $ne: req.customs.user.id },
        product: document.id,
      })
        .sort('-likesCount -createdAt')
        .limit(3),
    ]);
  } else {
    reviews = await Review.find({
      product: document.id,
    })
      .sort('-likesCount -createdAt')
      .limit(3);
  }

  // console.log(reviews);

  res.render('user/product-one', {
    document,
    reviewCurrent,
    reviews,
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////
// Addresses
exports.getAllAddressesMiddleware = (req, res, next) => {
  req.customs.getAll = {
    queryRestrict: {
      user: req.customs.user.id,
    },
    limitDefault: 100,
  };
  next();
};

exports.addLocationDetails = (req, res, next) => {
  res.locals.locationDetails = locationDetails;
  next();
};

exports.getAllAddresses = handlerFactoryAddress.getAll;
exports.getOneAddress = handlerFactoryAddress.getOne;
exports.getNewAddressForm = handlerFactoryAddress.getNewForm;

///////////////////////////////////////////////////////////////////////////////////////////////////
// Reviews
exports.getAllReviewsMiddleware = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new AppError('No page found', 404));
  }

  res.locals.product = product;

  const queryRestrict = {
    product: req.params.productId,
  };

  if (req.customs.user) {
    res.locals.reviewCurrent = await Review.findOne({
      product: req.params.productId,
      user: req.customs.user.id,
    });

    queryRestrict.user = { $ne: req.customs.user.id };
    queryRestrict.marked = { $ne: req.customs.user.id };
  }

  req.customs.getAll = {
    queryRestrict,
    sortDefault: '-likesCount,-createdAt',
    limitDefault: 5,
  };

  next();
});

exports.getAllReviews = handlerFactoryReview.getAll;

///////////////////////////////////////////////////////////////////////////////////////////////////
// Cart
exports.getCart = catchAsync(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.customs.user.id });

  if (!cart) {
    cart = new Cart({ user: req.customs.user.id });
  }

  await cart.verifyCart();
  await cart.save();

  res.render('user/cart', {
    document: cart,
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////
// Checkout
exports.getCheckoutSelectAddress = catchAsync(async (req, res, next) => {
  const documents = await Address.find({ user: req.customs.user.id });

  if (!documents) {
    return res.redirect('/checkout/address/new');
  }

  res.render('user/checkout-select-address', {
    documents,
  });
});

exports.getCheckoutNewAddress = catchAsync(async (req, res, next) => {
  res.render('user/checkout-new-address');
});

exports.getCheckoutMiddlewareChangeDocumentToAddressAndAttach = (
  req,
  res,
  next
) => {
  req.customs.address = req.customs.document;
  delete req.customs.document;

  res.locals.address = req.customs.address;

  next();
};

exports.getCheckout = catchAsync(async (req, res, next) => {
  res.render('user/checkout', {
    document: req.customs.document,
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////
// Wishlist
exports.getWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.customs.user.id });

  res.render('user/wishlist', {
    document: wishlist,
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////
// Orders
exports.getAllOrdersMiddleware = (req, res, next) => {
  req.customs.getAll = {
    queryRestrict: {
      user: req.customs.user.id,
    },
    limitDefault: 10,
  };
  next();
};

exports.getOneOrder = handlerFactoryOrder.getOne;
exports.getAllOrders = handlerFactoryOrder.getAll;
