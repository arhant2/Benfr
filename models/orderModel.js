const mongoose = require('mongoose');

const variations = {
  booked: Number,
  confirmed: Number,
  accepted: Number,
  now: Number,
};

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Order must have a user'],
    },
    products: [
      {
        id: mongoose.Types.ObjectId,
        name: String,
        price: String,
        discountedPrice: String,
        quantity: variations,
        totalPrice: variations,
      },
    ],
    totalPrice: variations,
    status: {
      type: [String],
      enum: [
        'booked',
        'confirmed',
        'packed',
        'inTransit',
        'delivered',
        'cancelled',
      ],
      default: ['booked'],
    },
    statusBy: [
      {
        id: mongoose.Types.ObjectId,
        type: String,
        enum: ['admin', 'customer', 'deliveryPerson'],
      },
    ],
    completed: {
      type: Boolean,
      default: false,
    },
    cancelled: {
      byId: mongoose.Types.ObjectId,
      by: {
        type: String,
        enum: ['admin', 'customer', 'deliveryPerson'],
      },
      reason: {
        type: String,
        trim: true,
        minlength: [
          4,
          'Reason for order cancellation must be of atleast 4 characters',
        ],
        maxlength: [
          50,
          'Reason for order cancellation must be of 50 characters at maximum',
        ],
      },
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
