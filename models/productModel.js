const mongoose = require('mongoose');

// ====== CICULAR DEPENDENCIES ======
// var Category = require('./categoryModel'); // defined below to handle circular dependencies
// var Brand = require('./brandModel'); // defined below to handle circular dependencies
// var Review = require('./reviewModel'); // defined below to handle circular dependencies

const AppError = require('../utils/AppError');
const stringNormalize = require('../utils/stringNormalize');
const gramsGenerator = require('../utils/gramsGenerator');
// const arrayRemoveReduntantAndUnecessary = require('../utils/arrayRemoveReduntantAndUnecessary');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Product must be a name'],
      min: [3, 'Product name must be of atleast 3 characters'],
      max: [40, 'Product name must have 40 characters at maximum'],
    },
    nameNormalized: {
      type: String,
      unique: true,
    },
    brandIdString: {
      type: String,
      required: true,
      validate: [(val) => mongoose.isValidObjectId(val), 'Invalid brand'],
    },
    review: {
      count: {
        type: Number,
        default: 0,
      },
      totalSum: {
        type: Number,
        default: 0,
      },
      average: {
        type: Number,
        default: 0,
      },
      averageNormalized: {
        type: Number,
        default: 0,
      },
    },
    brand: {
      type: mongoose.Mixed,
    },
    categoriesIdString: [
      {
        type: String,
        required: true,
        validate: [(val) => mongoose.isValidObjectId(val), 'Invalid category'],
      },
    ],
    categories: {
      type: mongoose.Mixed,
      default: [],
    },
    price: {
      type: Number,
      set: (val) => Math.round(val * 100) / 100,
      min: [0, 'Product price must be greater than 0'],
      required: ['Product must have a price'],
    },
    discountedPrice: {
      type: Number,
      set: (val) => Math.round(val * 100) / 100,
      min: [0, 'Dicounted product price must be greater than 0'],
      validate: {
        validator: function (val) {
          return val <= this.price;
        },
        message:
          'Discounted product price must be less than or equals to the price',
      },
      required: [true, 'Product must have a discounted price'],
    },
    description: {
      type: String,
      trim: true,
      required: true,
      minlength: [3, 'Description should of atleast 3 characters'],
      maxlength: [100, 'Description can be of 100 characters at maximum'],
    },
    specifications: {
      type: [
        {
          field: {
            type: String,
            trim: true,
            required: [true, 'Each specification must have a field'],
            min: [2, 'Each specification field must of at least 2 characters'],
            max: [
              25,
              'Each specification field must have 25 characters at maximum',
            ],
          },
          value: {
            type: String,
            trim: true,
            required: [true, 'Each specification must have a value'],
            min: [2, 'Each specification value must of at least 2 characters'],
            max: [
              75,
              'Each specification value must have 150 characters at maximum',
            ],
          },
        },
      ],
      default: [],
      validate: {
        validator: (val) => val.length <= 50,
        message: 'A product can have at max 50 specifications',
      },
    },
    published: {
      type: Boolean,
      default: false,
      required: true,
    },
    currentStock: {
      type: Number,
      default: 0,
      set: Math.trunc,
      required: true,
      min: [0, 'Current stock of product must be greater than equals to 0'],
    },
    maxPerOrder: {
      type: Number,
      default: 20,
      set: Math.trunc,
      required: true,
      min: [1, 'Maximum quantity of products must be atleast 1'],
    },
    quanitySold: {
      type: Number,
      default: 0,
    },
    images: {
      type: [
        {
          path: String,
          filename: String,
        },
      ],
      default: [],
    },
    grams: {
      type: {
        words: [String],
        stems: [String],
        distanceOnes: [String],
        distanceOneStems: [String],
        distanceOnesDatabase: [String],
        distanceOnesQuery: [String],
        distanceOnesSamePosition: [String],
        startEdgeGrams: [String],
        edgeGrams: [String],
        twoGrams: [String],
        select: false,
      },
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index(
  {
    'brand.name': 'text',
    'categories.name': 'text',
    'grams.words': 'text',
    'grams.stems': 'text',
    'grams.distanceOnes': 'text',
    'grams.distanceOneStems': 'text',
    'grams.distanceOnesDatabase': 'text',
    'grams.distanceOnesQuery': 'text',
    'grams.distanceOnesSamePosition': 'text',
    'grams.startEdgeGrams': 'text',
    'grams.edgeGrams': 'text',
    'grams.twoGrams': 'text',
  },
  {
    name: 'textSearchIndex',
    weights: {
      'brand.name': 1000,
      'categories.name': 500,
      'grams.words': 500,
      'grams.stems': 400,
      'grams.distanceOnes': 10,
      'grams.distanceOneStems': 10,
      'grams.distanceOnesDatabase': 200,
      'grams.distanceOnesQuery': 200,
      'grams.distanceOnesSamePosition': 300,
      'grams.startEdgeGrams': 100,
      'grams.edgeGrams': 12,
      'grams.twoGrams': 5,
    },
    // default_language: 'none',
  }
);

productSchema.virtual('maxQuantityAllowedNow').get(function () {
  return Math.min(
    this.maxPerOrder,
    this.currentStock === -1 ? Infinity : this.currentStock
  );
});

productSchema.index({
  'brand._id': 1,
  'category._id': 1,
});

productSchema.post('init', function () {
  this.originalFields = {
    brandIdString: this.brandIdString,
    categoriesIdString: this.categoriesIdString,
  };
});

productSchema.pre(/^save/, function (next) {
  if (this.isModified('name')) {
    this.grams = gramsGenerator.grams(this.name);
  }
  next();
});

// Save normalized name
productSchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  this.nameNormalized = stringNormalize.toString(this.name);
  next();
});

// Handling reviews
productSchema.pre('save', function (next) {
  if (!this.isModified('review.count') && !this.isModified('review.totalSum'))
    return next();

  if (this.review.count === 0) {
    this.review.average = 0;
    this.review.averageNormalized = 0;
  } else {
    this.review.average = this.review.totalSum / this.review.count;
    this.review.averageNormalized =
      0.5 * (this.review.average + (1 - Math.exp(-this.review.count / 10)));
  }
  next();
});

// Handling brands
productSchema.pre('save', async function (next) {
  if (!this.isModified('brandIdString')) return next();

  // eslint-disable-next-line no-use-before-define
  const brand = await Brand.findById(this.brandIdString).select('name');
  if (!brand) throw new AppError('Brand not found', 400);
  this.brand = brand.toObject();
  next();
});

// //Handling categories
productSchema.pre('save', async function (next) {
  if (!this.isModified('categoriesIdString')) return next();

  // eslint-disable-next-line no-use-before-define
  let categories = await Category.find({
    _id: { $in: this.categoriesIdString },
  }).select('name');

  if (categories) {
    categories = categories.map((category) => category.toObject());
  }
  this.categories = categories || [];

  this.categoriesIdString = this.categories.map((category) => category.id);

  next();
});

productSchema.pre('save', function (next) {
  this.wasNew = this.isNew;
  this.wasmodifiedBrand = this.isModified('brandIdString');
  this.wasModifiedCategories = this.isModified('categoriesIdString');
  next();
});

productSchema.post('save', async function () {
  const promises = [];

  const updateBrand = (_id, inc) => {
    promises.push(
      // eslint-disable-next-line no-use-before-define
      Brand.findByIdAndUpdate(_id, { $inc: { productsCount: inc } })
    );
  };

  const updateCategories = (_idArray, inc) => {
    if (_idArray.length) {
      promises.push(
        // eslint-disable-next-line no-use-before-define
        Category.updateMany(
          { _id: { $in: _idArray } },
          { $inc: { productsCount: inc } }
        )
      );
    }
  };

  if (this.wasNew) {
    updateBrand(this.brandIdString, 1);
    updateCategories(this.categoriesIdString, 1);
  } else {
    if (this.wasmodifiedBrand) {
      updateBrand(this.brandIdString, 1);
      updateBrand(this.originalFields.brandIdString, -1);
    }

    if (this.wasModifiedCategories) {
      let originalCategories = this.originalFields.categoriesIdString;
      let categoriesNow = this.categoriesIdString;

      const flags = {};
      originalCategories.forEach((id) => {
        flags[id] = 1;
      });
      categoriesNow.forEach((id) => {
        if (flags[id] === 1) {
          flags[id] = 2;
        }
      });
      originalCategories = originalCategories.filter((el) => flags[el] !== 2);
      categoriesNow = categoriesNow.filter((el) => flags[el] !== 2);

      updateCategories(originalCategories, -1);
      updateCategories(categoriesNow, 1);
    }
  }

  await Promise.allSettled(promises);
});

productSchema.post('deleteOne', async function (doc, next) {
  // console.log('fired');
  if (!doc) {
    return;
  }

  const promises = [];
  promises.push(
    // eslint-disable-next-line no-use-before-define
    Brand.findByIdAndUpdate(doc.brandIdString, { $inc: { productsCount: -1 } })
  );
  if (doc.categories.length) {
    promises.push(
      // eslint-disable-next-line no-use-before-define
      Category.updateMany(
        { _id: { $in: doc.categoriesIdString } },
        { $inc: { productsCount: -1 } }
      )
    );
  }

  await Promise.allSettled(promises);

  next();
});

productSchema.post('deleteOne', async function (doc, next) {
  // eslint-disable-next-line no-use-before-define
  await Review.deleteMany({
    product: doc._id,
  });
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

// eslint-disable-next-line no-var, vars-on-top
var Brand = require('./brandModel');
// eslint-disable-next-line no-var, vars-on-top
var Category = require('./categoryModel');
// eslint-disable-next-line no-var, vars-on-top
var Review = require('./reviewModel');
