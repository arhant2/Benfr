const path = require('path');

const mongoose = require('mongoose');
const pug = require('pug');

const Product = require('./productModel');
const AppError = require('../utils/AppError');
const generatePdf = require('../utils/generatePdf');
const dateFormator = require('../utils/dateFormator');

const { uploadThubmnail } = require('../cloudinary');

const invoiceCompile = pug.compileFile(
  path.join(__dirname, '../views/invoice/invoice.pug')
);

// VariationSchema to use virtuals
const variationSchema = new mongoose.Schema(
  {
    booked: Number,
    confirmed: Number,
    delivered: Number,
    // now: Number, (virtual)
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

variationSchema.virtual('now').get(function () {
  if (this.delivered !== undefined) {
    return this.delivered;
  }
  if (this.confirmed !== undefined) {
    return this.confirmed;
  }
  return this.booked;
});

// product scheama to use totalEach virtual
const orderProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
    },
    name: String,
    price: Number,
    discountedPrice: Number,
    thumbnail: {
      path: String,
      filename: String,
    },
    quantity: variationSchema,
    // totalEach: Number (virtual)
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderProductSchema.virtual('totalEach').get(function () {
  return this.discountedPrice * this.quantity.now;
});

const statusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: [
        'booked',
        'confirmed',
        'packed',
        'inTransit',
        'delivered',
        'cancelled',
      ],
    },
  },
  {
    timestamps: true,
  }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    products: [orderProductSchema],
    // subTotal: Number, (virtual)
    // grandTotal: Number, (virtual)
    deliveryCharge: Number,
    statusAll: {
      type: [statusSchema],
      default: [
        {
          name: 'booked',
        },
      ],
    },
    address: mongoose.Schema.Types.Mixed,
    cancelled: {
      by: {
        user: { type: mongoose.Types.ObjectId, ref: 'User' },
        userType: {
          type: String,
          enum: ['admin', 'user'],
        },
      },
      reason: {
        type: String,
        trim: true,
        minlength: [
          4,
          'Reason for order cancellation must be of atleast 4 characters',
        ],
        maxlength: [
          200,
          'Reason for order cancellation must be of 200 characters at maximum',
        ],
      },
    },
    status: mongoose.Schema.Types.Mixed,
    subTotal: Number,
    grandTotal: Number,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.pre('save', function (next) {
  // console.log(this.isModified('statusAll'));

  if (this.isModified('statusAll')) {
    this.status = this.statusAll[this.statusAll.length - 1];
  }
  if (this.isModified('products')) {
    this.subTotal = this.products.reduce(
      (total, product) => total + product.totalEach,
      0
    );
  }
  if (this.isModified('subTotal') || this.isModified('deliveryCharge')) {
    this.grandTotal = this.subTotal + this.deliveryCharge;
  }

  next();
});

// orderSchema.virtual('status').get(function () {
//   return this.statusAll[this.statusAll.length - 1];
// });

// orderSchema.virtual('subTotal').get(function () {
//   return this.products.reduce((total, product) => total + product.totalEach, 0);
// });

// orderSchema.virtual('grandTotal').get(function () {
//   return this.subTotal + this.deliveryCharge;
// });

//////////////////////////////////////////
// New Order
//////////////////////////////////////////
orderSchema.statics.newOrder = async function (user, address, cart) {
  const Order = this;

  const order = new Order();

  order.user = user;
  order.address = address;

  order.deliveryCharge = cart.deliveryCharge;

  order.products = await Promise.all(
    cart.products.map(async ({ product, quantity }) => {
      const obj = {
        product: product,
        name: product.name,
        price: product.price,
        discountedPrice: product.discountedPrice,
        quantity: {
          booked: quantity,
        },
      };

      const filename = product.images?.[0]?.filename;

      if (filename) {
        obj.thumbnail = await uploadThubmnail(
          filename,
          'benfr/thumbnails/products'
        );
      }

      return obj;
    })
  );

  await order.save();

  await Promise.allSettled([
    ...order.products.map(({ product, quantity }) => {
      product.currentStock -= quantity.now;
      product.quantitySold += quantity.now;

      return product.save();
    }),
    cart.remove(),
  ]);

  return order;
};

//////////////////////////////////////////
// Move to next step
//////////////////////////////////////////

// booked -> confirmed -> packed -> inTransit -> delivered
//        ^                                   ^
//        |      <~~~ Can change here ~~~>    |

orderSchema.methods.nextStage = async function (
  expectedStatus,
  productsRequested
) {
  if (this.status.name !== expectedStatus) {
    throw new AppError(
      'Cannot move to next stage, try again later or try by refreshing (Order not in requested/displayed stage)',
      400
    );
  }
  // If cancelled or delivered nothing can be done
  if (this.status.name === 'cancelled') {
    throw new AppError('Cancelled order cannot be modified', 400);
  }
  if (this.status.name === 'delivered') {
    throw new AppError('Delivered order cannot be modified', 400);
  }

  // Store mongoose queries for Product(s) updation
  const mongooseQueries = [];

  // If booked or inTranit productsRequested can be there for updation
  if (this.status.name === 'booked' || this.status.name === 'inTransit') {
    // if not there create one
    if (productsRequested === undefined) {
      productsRequested = [];
    }

    // check if productsRequest is in correct form
    if (
      !Array.isArray(productsRequested) ||
      !productsRequested.every(
        (product) =>
          product &&
          typeof product === 'object' &&
          mongoose.isValidObjectId(product.product) &&
          typeof (product.quantity * 1) === 'number' &&
          product.quantity >= 0
      )
    ) {
      // console.log('Yaha aaya');
      throw new AppError(
        'Invalid request, please send request in correct form',
        400
      );
    }

    // only keep needed properties i.e. product and quantity
    productsRequested = productsRequested.map(({ product, quantity }) => ({
      product,
      quantity: quantity * 1,
    }));

    // for each products in database, update them
    this.products.forEach((productDB) => {
      // Find if a product is requested
      let productRequested = productsRequested.find(
        (product) => product.product === productDB.product.toString()
      );

      // if not found create one
      if (!productRequested) {
        productRequested = {
          product: productDB.product,
          quantity: productDB.quantity.now,
        };
      }

      // if database has low quantity than request, throw error
      if (productDB.quantity.now < productRequested.quantity) {
        throw new AppError(
          'Invalid request, you cannot increase product quantity',
          400
        );
      }
      // if database has high quantity update it
      else if (productDB.quantity.now > productRequested.quantity) {
        const quantityDiff = productDB.quantity.now - productRequested.quantity;

        // console.log('yo: ', quantityDiff);

        mongooseQueries.push(
          Product.findByIdAndUpdate(productDB.product, {
            $inc: {
              currentStock: quantityDiff,
              quantitySold: -quantityDiff,
            },
          })
        );
      }

      if (this.status.name === 'booked') {
        productDB.quantity.confirmed = productRequested.quantity;
      } else {
        productDB.quantity.delivered = productRequested.quantity;
      }
    });
  }

  // console.log(this);

  // throw new AppError('Testing error', 400);

  const statusTypes = [
    'booked',
    'confirmed',
    'packed',
    'inTransit',
    'delivered',
  ];

  // Change status
  this.statusAll.push({
    name:
      statusTypes[
        statusTypes.findIndex((status) => status === this.status.name) + 1
      ],
  });

  // Save document
  await this.save();

  // if mongooseQueries is there execute them
  if (mongooseQueries.length > 0) {
    await Promise.allSettled(mongooseQueries);

    // console.log(mongooseQueries);
  }
};

//////////////////////////////////////////
// Cancel Order
//////////////////////////////////////////
orderSchema.methods.cancelOrder = async function (user, reason) {
  // If cancelled or delivered nothing can be done
  if (this.status.name === 'cancelled') {
    throw new AppError('Order is already cancelled', 400);
  }
  if (this.status.name === 'delivered') {
    throw new AppError('Delivered order cannot be cancelled', 400);
  }

  if (user.role === 'user' && this.status.name === 'inTransit') {
    throw new AppError(
      'Order is In-Transit, You cannot cancel the order!',
      400
    );
  }

  if (!reason) {
    throw new AppError('Please give a reason for order cancellation', 400);
  }

  this.statusAll.push({ name: 'cancelled' });
  this.cancelled = {
    by: {
      user,
      userType: user.role,
    },
    reason,
  };

  await this.save();

  const mongooseQueries = [];

  const quantityCalculate = (productDB) => {
    if (productDB.quantity.delivered !== undefined) {
      return productDB.quantity.delivered;
    }
    if (productDB.quantity.confirmed !== undefined) {
      return productDB.quantity.confirmed;
    }
    return productDB.quantity.booked;
  };

  this.products.forEach((productDB) => {
    // console.log(productDB);
    const quantity = quantityCalculate(productDB);

    if (quantity > 0) {
      mongooseQueries.push(
        Product.findByIdAndUpdate(productDB.product, {
          $inc: {
            currentStock: quantity,
            quantitySold: -quantity,
          },
        })
      );
    }
  });

  if (mongooseQueries.length > 0) {
    await Promise.allSettled(mongooseQueries);
  }
};

//////////////////////////////////////////
// Generate pdf invoice
//////////////////////////////////////////
orderSchema.methods.pdfInvoice = async function (baseUrl) {
  if (this.status.name === 'cancelled') {
    throw new AppError('Order is cancelled, cannot get invoice', 400);
  }

  const { user } = this;

  if (!this.populated('user')) {
    await this.populate('user').execPopulate();
  }

  const invoiceHtml = invoiceCompile({
    baseUrl,
    document: this,
    dateFormator,
  });

  const pdf = await generatePdf(invoiceHtml);

  this.user = user;

  return pdf;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
