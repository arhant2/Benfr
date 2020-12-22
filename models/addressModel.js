const path = require('path');

const fs = require('fs');
const mongoose = require('mongoose');

const userDetailsOptions = require('./helpers/userDetailsOptions')(
  'address',
  'address'
);

const allDetailsByState = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../staticData/allDetailsByState.json'))
);

const addressSchema = mongoose.Schema({
  user: mongoose.Types.ObjectId,
  name: userDetailsOptions.name(),
  mobile: userDetailsOptions.mobile(),
  address: {
    flat: {
      type: String,
      trim: true,
      required: [
        true,
        'Address must have a Flat no/House no/Building/Apartment',
      ],
      minlength: [
        2,
        'Flat no/House no/Building/Apartment must be of atleast 2 characters',
      ],
      maxlength: [
        30,
        'Flat no/House no/Building/ApartmentProduct name must have 30 characters at maximum',
      ],
    },
    area: {
      type: String,
      trim: true,
      required: [true, 'Address must have a Area/Village/Town/Street '],
      minlength: [
        3,
        'Area/Village/Town/Street must be of atleast 3 characters',
      ],
      maxlength: [
        30,
        'Area/Village/Town/Street Product name must have 30 characters at maximum',
      ],
    },
    landmark: {
      type: String,
      trim: true,
      minlength: [3, 'Landmark must be of atleast 3 characters'],
      maxlength: [
        30,
        'Landmark Product name must have 30 characters at maximum',
      ],
    },
    state: {
      type: String,
      required: [true, 'Address must have a state'],
      validate: {
        validator: function (val) {
          return Boolean(allDetailsByState[val]);
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
            allDetailsByState[this.address.state] &&
              allDetailsByState[this.address.state].districts[val]
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
              allDetailsByState[this.address.state] &&
              allDetailsByState[
                this.address.state
              ].pincodeStartsWith.find((start) => val.startsWith(start)) !==
                undefined
          );
        },
      },
    },
  },
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
