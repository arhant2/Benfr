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
    },
    nameNormalized: {
      type: String,
      unique: true,
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

brandSchema.post('save', async function (next) {
  if (this.notNewAndmodifiedName) {
    // eslint-disable-next-line no-use-before-define
    await Product.updateMany({ 'brand._id': this._id }, { brand: this });
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
