const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Product must be a name'],
      min: [5, 'Product name must be of atleast 5 characters'],
      max: [50, 'Product name must have 50 characters at maximum'],
    },
    price: {
      type: Number,
      min: ['Product price must be greater than 0'],
      required: ['Product must have a price'],
    },
    discountedPrice: {
      type: Number,
      min: 0,
      required: ['Discounted Product must have a price'],
    },
    specifications: [
      {
        field: {
          type: String,
          trim: true,
          required: [true, 'Each specification must have a field'],
          min: [5, 'Each specification field must of at least 5 characters'],
          max: [
            40,
            'Each specification field must have 40 characters at maximum',
          ],
        },
        value: {
          type: String,
          trim: true,
          required: [true, 'Each specification must have a value'],
          min: [5, 'Each specification value must of at least 5 characters'],
          max: [
            40,
            'Each specification value must have 40 characters at maximum',
          ],
        },
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
