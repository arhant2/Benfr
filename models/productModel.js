const mongoose = require('mongoose');
// const slugify = require('slugify');

// var Category = require('./categoryModel'); // defined below to handle circular dependencies
// var Brand = require('./brandModel'); // defined below to handle circular dependencies

const AppError = require('../utils/AppError');
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
    brand: {
      type: mongoose.Mixed,
      required: true,
    },
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
              150,
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
      min: [
        -1,
        'Current stock of product must be greater than equals to 0 or -1(infinite)',
      ],
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
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
    brand: this.brand,
    categories: this.categories,
  };
});

// Handling brands
productSchema.pre('save', async function (next) {
  if (!this.isModified('brand')) return next();

  if (!mongoose.isValidObjectId(this.brand))
    throw new AppError('Invalid request! Invalid brand', 400);

  // eslint-disable-next-line no-use-before-define
  const brand = await Brand.findById(this.brand).select('name');

  if (!brand) throw new AppError('Brand not found', 400);

  this.brand = brand;

  next();
});

// //Handling categories
productSchema.pre('save', async function (next) {
  if (!this.isModified('categories')) return next();

  if (
    !Array.isArray(this.categories) ||
    !this.categories.every((el) => mongoose.isValidObjectId(el))
  )
    throw new AppError('Invalid categories', 400);

  // eslint-disable-next-line no-use-before-define
  const categories = await Category.find({
    _id: { $in: this.categories },
  }).select('name');
  this.categories = categories || [];
  next();
});

productSchema.pre('save', function () {
  this.wasNew = this.isNew;
  this.wasmodifiedBrand = this.isModified('brand');
  this.wasModifiedCategories = this.isModified('categories');
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
    if (this.categories.length) {
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
    updateBrand(this.brand._id, 1);
    updateCategories(
      this.categories.map((c) => c._id),
      1
    );
  } else {
    if (this.wasmodifiedBrand) {
      updateBrand(this.brand._id, 1);
      updateBrand(this.originalFields.brand._id, -1);
    }

    if (this.wasmodifiedBrand) {
      let originalCategories = this.originalFields.categories.map((c) => c._id);
      let categoriesNow = this.originalCategories.categories.map((c) => c._id);

      const flags = {};
      originalCategories.forEach((id) => {
        flags[id] = 1;
      });
      categoriesNow.forEach((id) => {
        flags[id] = 2;
      });
      originalCategories = originalCategories.filter((el) => flags[el] !== 2);
      categoriesNow = categoriesNow.filter((el) => flags[el] !== 2);

      updateCategories(originalCategories, -1);
      updateCategories(categoriesNow, 1);
    }
  }

  await Promise.allSettled(promises);
});

productSchema.post(/delete/i, async function (doc) {
  // console.log('fired');

  const promises = [];
  promises.push(
    // eslint-disable-next-line no-use-before-define
    Brand.findByIdAndUpdate(doc.brand._id, { $inc: { productsCount: -1 } })
  );
  if (doc.categories.length) {
    promises.push(
      // eslint-disable-next-line no-use-before-define
      Category.updateMany(
        { _id: { $in: doc.categories.map((el) => el._id) } },
        { $inc: { productsCount: -1 } }
      )
    );
  }

  await Promise.allSettled(promises);
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

// eslint-disable-next-line no-var, vars-on-top
var Brand = require('./brandModel');
// eslint-disable-next-line no-var, vars-on-top
var Category = require('./categoryModel');
