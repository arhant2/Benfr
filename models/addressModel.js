const mongoose = require('mongoose');

const { locationDetailsParsed } = require('../utils/locationDetails');

const userDetailsOptions = require('./helpers/userDetailsOptions')(
  'address',
  'address'
);

const addressSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    name: userDetailsOptions.name(),
    mobile: userDetailsOptions.mobile(),
    address: {
      flat: {
        type: String,
        trim: true,
        required: [
          true,
          'Address must have a Flat, House no., Building, Apartment',
        ],
        minlength: [
          2,
          'Flat, House no., Building, Apartment must be of atleast 2 characters',
        ],
        maxlength: [
          50,
          'Flat, House no., Building, Apartment must have 50 characters at maximum',
        ],
      },
      area: {
        type: String,
        trim: true,
        required: [true, 'Address must have a Area/Village/Town/Street'],
        minlength: [
          2,
          'Area, Village, Town, Street must be of atleast 2 characters',
        ],
        maxlength: [
          50,
          'Area, Village, Town, Street must have 50 characters at maximum',
        ],
      },
      landmark: {
        type: String,
        trim: true,
        minlength: [2, 'Landmark must be of atleast 2 characters'],
        maxlength: [50, 'Landmark must have 50 characters at maximum'],
      },
      state: {
        type: String,
        required: [true, 'Address must have a state'],
        validate: {
          validator: function (val) {
            return Boolean(locationDetailsParsed[val]);
          },
          message: 'Invalid state',
        },
      },
      district: {
        type: String,
        required: [true, 'Address must have a district'],
        validate: {
          validator: function (val) {
            return Boolean(
              locationDetailsParsed[this.address.state] &&
                locationDetailsParsed[this.address.state].districts[val]
            );
          },
          message: 'Invalid district',
        },
      },
      pincode: {
        type: String,
        trim: true,
        required: [true, 'Address must have a pincode'],
        validate: {
          validator: function (val) {
            return Boolean(
              val.length === 6 &&
                val.match(/^[0-9]*$/) &&
                locationDetailsParsed[this.address.state] &&
                locationDetailsParsed[
                  this.address.state
                ].pincodeStartsWith.find((start) => val.startsWith(start)) !==
                  undefined
            );
          },
          message: 'Invalid pincode',
        },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
