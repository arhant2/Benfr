const validator = require('validator');
const mongoose = require('mongoose');

const { createHash, createRandomString } = require('../utils/crytography');

const unverifiedUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      validate: [validator.isEmail, 'Invalid email'],
      required: [true, 'User must have an email'],
      unique: true,
      trim: true,
      set: validator.normalizeEmail,
    },
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

const UnverifiedUser = mongoose.model('NewUserToken', unverifiedUserSchema);

module.exports = UnverifiedUser;
