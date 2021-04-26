const mongoose = require('mongoose');

// ====== CICULAR DEPENDENCIES ======
// var Product = require('./productModel'); // defined below to handle circular dependencies
const User = require('./userModel');
const Email = require('../utils/email');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    star: {
      type: Number,
      min: [1, 'Star in rating should be atleast 1'],
      max: [5, 'Star in rating can be atmost 1'],
      required: true,
      set: Math.trunc,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [50, 'Title of rating can be at maximum of 50 characters'],
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [
        300,
        'Description of rating can be at maximum of 300 characters',
      ],
      default: '',
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    marked: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    markedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index(
  {
    user: 1,
    product: 1,
  },
  { unique: true }
);

reviewSchema.post('init', function () {
  this.originalFields = {
    star: this.star,
  };
});

reviewSchema.pre(/^find/, async function (next) {
  // console.log(this);
  this.populate({
    path: 'user',
    select: 'name email',
  });
  next();
});

reviewSchema.pre('save', function (next) {
  if (this.isModified('likes')) {
    this.likesCount = this.likes.length;
  }
  if (this.isModified('marked')) {
    this.markedCount = this.marked.length;
  }
  next();
});

reviewSchema.pre('save', function (next) {
  // console.log('Yaha aaya: ', this.isModified('star'));

  this.wasNew = this.isNew;
  this.wasModifiedStar = this.isModified('star');
  this.wasModifiedMarked = this.isModified('marked');
  next();
});

reviewSchema.post('save', async function (doc, next) {
  // console.log(this.wasModifiedStar);

  if (!this.wasModifiedStar) return;

  // eslint-disable-next-line no-use-before-define
  const product = await Product.findById(doc.product);
  product.review.count += doc.wasNew ? 1 : 0;
  product.review.totalSum +=
    doc.star - (!doc.wasNew ? this.originalFields.star : 0);

  await product.save();
  next();
});

reviewSchema.post('save', async function (doc, next) {
  try {
    if (!doc.wasModifiedMarked) return next();

    if (doc.markedCount < process.env.MAXIMUM_MARK_REVIEW_FOR_AUTO_DELETE)
      return next();

    const Review = doc.constructor;
    const review = await Review.findByIdAndDelete(doc.id);

    await new Email(doc.user, doc.baseUrlForEmail).sendReviewDeleteAlert({
      title: doc.title,
      body: review.description || '(no body)',
    });

    const user = await User.findById(doc.user._id);
    user.deletedReviewCount += 1;

    user.baseUrlForEmail = doc.baseUrlForEmail;

    await user.save();
  } catch (err) {
    console.log('🔥Error while auto deleting marked review');
    console.log(err);
  }

  next();
});

reviewSchema.post('findOneAndDelete', async function (doc, next) {
  // eslint-disable-next-line no-use-before-define
  const product = await Product.findById(doc.product);

  product.review.count -= 1;
  product.review.totalSum -= doc.star;

  await product.save();
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

// eslint-disable-next-line no-var, vars-on-top
var Product = require('./productModel');
