const mongoose = require('mongoose');

// var Product = require('./productModel'); // defined below to handle circular dependencies
const stringNormalize = require('../utils/stringNormalize');
const AppError = require('../utils/AppError');

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      min: [2, 'Brand name must have atleast 2 characters'],
      max: [30, 'Brand name can have atmost 30 characters'],
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      set: Math.trunc,
      min: [1, 'Score can should be atleast 1'],
      max: [10, 'Score can be 10 at maximum'],
      default: 1,
      required: true,
    },
    nameNormalized: {
      type: String,
      unique: true,
    },
    productsCount: {
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

// brandSchema.virtual('slug').get(function () {
//   return slugify(this.name, { lower: true });
// });

brandSchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  this.notNewAndmodifiedName = !this.isNew && this.isModified('name');
  this.nameNormalized = stringNormalize.toString(this.name);
  next();
});

brandSchema.post('save', async function (doc) {
  // console.log(typeof doc.toObject()._id);
  if (this.notNewAndmodifiedName) {
    const brand = {
      _id: doc._id,
      id: doc.id,
      name: doc.name,
    };

    // eslint-disable-next-line no-use-before-define
    await Product.updateMany({ 'brand._id': this._id }, { brand });
  }
});

brandSchema.pre('findOneAndDelete', async function (next) {
  const id = mongoose.Types.ObjectId(this.getFilter()._id);
  // eslint-disable-next-line no-use-before-define
  if (await Product.exists({ 'brand._id': id }))
    throw new AppError(
      'Cannot delete brand, There are some products with this brand',
      400
    );
  next();
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;

// eslint-disable-next-line no-var, vars-on-top
var Product = require('./productModel');
