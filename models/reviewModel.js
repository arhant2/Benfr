const mongoose = require('mongoose');

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
    description: {
      type: String,
      trim: true,
      maxlength: [
        100,
        'Description of rating can be at maxium of 100 characters',
      ],
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    marked: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
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

const Review = mongoose.Model('Review', reviewSchema);

module.exports = Review;
