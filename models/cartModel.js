const mongoose = require('mongoose');

const AppError = require('../utils/AppError');
const Product = require('./productModel');

const cartProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      min: [1, 'Quantity of each product must be greater than 1'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

cartProductSchema.virtual('totalEach').get(function () {
  return this.product.discountedPrice * this.quantity;
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      unique: true,
      ref: 'User',
    },
    products: {
      type: [cartProductSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

cartSchema.virtual('subTotal').get(function () {
  return this.products.reduce((total, product) => total + product.totalEach, 0);
});

cartSchema.virtual('deliveryCharge').get(function () {
  return this.subTotal < 1000 ? 50 : 0;
});

cartSchema.virtual('grandTotal').get(function () {
  return this.subTotal + this.deliveryCharge;
});

cartSchema.pre(/^find/, function (next) {
  // console.log(this);
  this.populate({ path: 'products.product', match: { published: true } });
  next();
});

cartSchema.methods.clearCart = function () {
  this.products = [];
};

cartSchema.methods.verifyCart = function () {
  this.products = this.products.filter(
    (product) =>
      !!product &&
      product.quantity >= 0 &&
      product.product.maxQuantityAllowedNow >= 0
  );

  this.products.forEach((product) => {
    product.quantity = Math.min(
      product.quantity,
      product.product.maxQuantityAllowedNow
    );
  });
};

cartSchema.methods.addToCart = async function (id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid product', 400);
  }

  // eslint-disable-next-line eqeqeq
  let idx = this.products.findIndex((product) => product.product.id == id);

  if (idx === -1) {
    const product = await Product.findOne({ _id: id, published: true });

    if (!product || product.maxQuantityAllowedNow <= 0) {
      throw new AppError('Invalid product', 400);
    }

    this.products.push({
      product,
      quantity: 0,
    });

    idx = this.products.length - 1;
  }

  if (
    this.products[idx].quantity >=
    this.products[idx].product.maxQuantityAllowedNow
  ) {
    throw new AppError(
      'You have reached the maximum quantity you can purchase for this product, checkout now or try later',
      400
    );
  }

  this.products[idx].quantity += 1;
};

cartSchema.methods.createCart = async function (productsRaw) {
  if (!Array.isArray(productsRaw)) {
    throw new AppError('Invalid request', 400);
  }

  productsRaw = productsRaw.filter(
    (productRaw) =>
      typeof productRaw === 'object' &&
      mongoose.isValidObjectId(productRaw.product) &&
      productRaw.quantity * 1 > 0
  );

  productsRaw = productsRaw.map(({ product, quantity }) => ({
    product,
    quantity: quantity * 1,
  }));

  const productIds = productsRaw.map((productRaw) => productRaw.product);
  const products = await Product.find({
    _id: { $in: productIds },
    published: true,
  });
  const productsMap = {};

  products.forEach((product) => {
    productsMap[product.id] = product;
  });

  productsRaw = productsRaw.filter(
    (productRaw) =>
      productsMap[productRaw.product] &&
      productsMap[productRaw.product].maxQuantityAllowedNow > 0
  );

  this.products = productsRaw.map(({ product, quantity }) => ({
    product: productsMap[product],
    quantity: Math.min(quantity, productsMap[product].maxQuantityAllowedNow),
  }));
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
