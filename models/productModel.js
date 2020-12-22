const mongoose = require('mongoose');
// const slugify = require('slugify');

// var Category = require('./categoryModel'); // defined below to handle circular dependencies
// var Brand = require('./brandModel'); // defined below to handle circular dependencies

const AppError = require('../utils/AppError');
const arrayRemoveReduntantAndUnecessary = require('../utils/arrayRemoveReduntantAndUnecessary');

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
      set: (val) => Math.round(val * 100) / 10,
      min: [0, 'Product price must be greater than 0'],
      required: ['Product must have a price'],
    },
    discountedPrice: {
      type: Number,
      set: (val) => Math.round(val * 100) / 10,
      min: [0, 'Dicounted product price must be greater than 0'],
      validate: {
        validator: (val) => val <= this.price,
        message:
          'Discounted product price must be less than or equals to the price',
      },
      required: ['Discounted Product must have a price'],
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
    images: [String],
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
  const brand = await Brand.findById(this.brand);

  if (!brand) throw new AppError('Brand not found', 400);

  this.brand = brand;

  next();
});

// //Handling categories
productSchema.pre('save', async function (next) {
  if (!this.isModified('categories')) return next();

  const isInvalidArrayOfId = (arr) => {
    if (!Array.isArray(arr)) {
      return true;
    }
    arr.forEach((el) => {
      if (!mongoose.isValidObjectId(el)) {
        return true;
      }
    });
    return false;
  };

  if (this.isNew && !Array.isArray(this.categories))
    throw new AppError('Invalid categories');

  if (Array.isArray(this.categories)) {
    if (isInvalidArrayOfId(this.categories))
      throw new AppError('Invalid categories', 400);
    const categories = await Category.find({ _id: { $in: this.categories } });
    if (!categories || categories.length === 0)
      throw new AppError('Invalid categories! Not found any categories');
    this.categories = categories;
    next();
  }

  let favourable = typeof this.categories === 'object';

  //either add or remove or both should be there
  favourable = favourable && !!(this.categories.add || this.categories.remove);

  // if add is there it should of type of array
  favourable =
    favourable &&
    !(this.categories.add && isInvalidArrayOfId(this.categories.add));

  // if remove is there it should of type of array
  favourable =
    favourable &&
    !(this.categories.remove && isInvalidArrayOfId(this.categories.remove));

  if (!favourable)
    throw new AppError(
      'Invalid request! Please send change categories request in correct form',
      400
    );

  let { categories } = this.originalFields;

  if (this.categories.remove) {
    const shouldRemove = {};
    this.categories.remove.forEach((el) => {
      shouldRemove[el] = true;
    });
    if (this.categories.add)
      this.categories.add.forEach((el) => {
        shouldRemove[el] = false;
      });
    categories = categories.filter((el) => !shouldRemove[el._id]);
  }

  let newCategories = {};

  if (this.categories.add) {
    this.categories.add = arrayRemoveReduntantAndUnecessary(
      this.categories.add,
      categories.map((el) => el._id)
    );
    // eslint-disable-next-line no-use-before-define
    newCategories = await Category.findOne({
      _id: { $in: this.categories.add },
    });
  }

  this.categories = [...categories, newCategories];

  console.log(this.categories);

  next();
});

// productSchema.virtual('slug').get(function () {
//   return slugify(this.name, { lower: true });
// });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

// eslint-disable-next-line no-var, vars-on-top
var Brand = require('./brandModel');
// eslint-disable-next-line no-var, vars-on-top
var Category = require('./categoryModel');
