// const validator = require('validator');
const mongoose = require('mongoose');

const { createHash, createRandomString } = require('../utils/crytography');

const userDetailsOptions = require('./helpers/userDetailsOptions')(
  'user',
  'users'
);

const unverifiedUserSchema = new mongoose.Schema(
  {
    email: userDetailsOptions.email(),
    attemptsRemaining: {
      type: Number,
      default: process.env.NEW_USER_SIGNUP_ATTEMPTS_IN_A_DAY - 1 || 2,
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
unverifiedUserSchema.index({ updatedAt: 1 }, { expires: '1d' });
// unverifiedUserSchema.index({ updatedAt: 1 }, { expires: '5min' });

unverifiedUserSchema.methods.createToken = function () {
  const tokenUnhashed = createRandomString(32);

  this.token = createHash(tokenUnhashed);

  return tokenUnhashed;
};

unverifiedUserSchema.methods.attemptsExceeded = function () {
  if (this.attemptsRemaining <= 0) {
    return true;
  }

  this.attemptsRemaining -= 1;

  return false;
};

const UnverifiedUser = mongoose.model('NewUserToken', unverifiedUserSchema);

module.exports = UnverifiedUser;
