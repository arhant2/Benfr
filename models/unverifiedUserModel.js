const validator = require('validator');
const mongoose = require('mongoose');

const { createHash, createRandomString } = require('../utils/crytography');

const userDetailsOptions = require('./helpers/userDetailsOptions')(
  'user',
  'users'
);

const unverifiedUserSchema = new mongoose.Schema(
  {
    email: userDetailsOptions.email(),
    attemptsCount: {
      type: Number,
      min: 1,
      max: process.env.NEW_USER_SIGNUP_ATTEMPTS_IN_A_DAY || 3,
      default: 1,
    },
    token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

unverifiedUserSchema.index({ token: 1 });
// unverifiedUserSchema.index({ updatedAt: 1 }, { expires: '1d' });
unverifiedUserSchema.index({ updatedAt: 1 }, { expires: '5min' });

unverifiedUserSchema.methods.createToken = function () {
  const tokenUnhashed = createRandomString(32);

  this.token = createHash(tokenUnhashed);

  return tokenUnhashed;
};

unverifiedUserSchema.methods.attemptsExceeded = function () {
  return (
    this.attemptsCount >= (process.env.NEW_USER_SIGNUP_ATTEMPTS_IN_A_DAY || 3)
  );
};

const UnverifiedUser = mongoose.model('NewUserToken', unverifiedUserSchema);

module.exports = UnverifiedUser;
