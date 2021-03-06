const mongoose = require('mongoose');

// var Product = require('./productModel'); // defined below to handle circular dependencies
const stringNormalize = require('../utils/stringNormalize');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      min: [2, 'Category name must have atleast 2 characters'],
      max: [30, 'Category name can have atmost 30 characters'],
      required: true,
      trim: true,
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

// categorySchema.virtual('slug').get(function () {
//   return slugify(this.name, { lower: true });
// });

categorySchema.pre('save', function (next) {
  if (!this.isModified()) return next();
  this.nameNormalized = stringNormalize.toString(this.name);
  next();
});

categorySchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  this.notNewAndmodifiedName = !this.isNew && this.isModified('name');
  this.nameNormalized = stringNormalize.toString(this.name);
  next();
});

categorySchema.post('save', async function (doc) {
  if (this.notNewAndmodifiedName) {
    // eslint-disable-next-line no-use-before-define
    await Product.updateMany(
      { 'categories._id': doc._id },
      { $set: { 'categories.$': doc } }
    );
  }
});

categorySchema.post('findOneAndDelete', async function (doc) {
  const id = mongoose.Types.ObjectId(doc.id);
  // eslint-disable-next-line no-use-before-define
  await Product.updateMany(
    { 'categories._id': id },
    { $pull: { categories: { _id: id } } }
  );
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
// eslint-disable-next-line no-var, vars-on-top
var Product = require('./productModel');
