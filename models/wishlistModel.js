const mongoose = require('mongoose');

const { uploadThubmnail } = require('../cloudinary');

const wishlistProductSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  name: String,
  price: Number,
  brand: String,
  discountedPrice: Number,
  thumbnail: {
    path: String,
    filename: String,
  },
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  products: {
    type: [wishlistProductSchema],
    default: [],
  },
});

wishlistSchema.pre(/^find/, function (next) {
  this.populate({ path: 'products.product', match: { published: true } });
  next();
});

wishlistSchema.methods.addProduct = async function (newProduct) {
  const oldIndex = this.products.findIndex(
    ({ productId }) => productId.toString() === newProduct._id.toString()
  );

  if (oldIndex !== -1) {
    this.products.splice(oldIndex, 1);
  }

  const obj = {
    productId: newProduct._id,
    product: newProduct,
    name: newProduct.name,
    price: newProduct.price,
    discountedPrice: newProduct.discountedPrice,
    brand: newProduct.brand.name,
  };

  const filename = newProduct.images?.[0]?.filename;

  if (filename) {
    obj.thumbnail = await uploadThubmnail(
      filename,
      'benfr/thumbnails/products'
    );
  }

  this.products.unshift(obj);
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
