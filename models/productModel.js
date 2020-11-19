const mongoose = require('mongoose');
const slugify = require('slugify');

const mongooseHelper = require('../utils/mogooseHelper')('Product');

const productSchema = new mongoose.Schema(
  {
    name: mongooseHelper.field.minMaxString('Name', 5, 80),
    price: mongooseHelper.field.minMaxNumber('Price', 0, undefined),
    discountedPrice: mongooseHelper.field.minMaxNumber(
      'Discounted price',
      0,
      undefined
    ),
    specifications: [
      {
        field: mongooseHelper.field.minMaxString('Specification field', 5, 80),
        value: mongooseHelper.field.minMaxString(
          'Specification value',
          10,
          300
        ),
      },
    ],
    imageCover: String,
    images: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual('slug').get(function () {
  return slugify(this.name, { lower: true });
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
