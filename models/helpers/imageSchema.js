const mongoose = require('mongoose');

const { getThumbnailLink } = require('../../cloudinary');

const imageSchema = new mongoose.Schema(
  {
    path: String,
    filename: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

imageSchema.virtual('thumbnail').get(function () {
  return getThumbnailLink(this.filename);
});

module.exports = imageSchema;
