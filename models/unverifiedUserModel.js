const crypto = require('crypto');

const validator = require('validator');
const mongoose = require('mongoose');

const mongooseHelper = require('../utils/mogooseHelper')('New User');

const unverifiedUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      validate: [validator.isEmail, 'Invalid email'],
      required: mongooseHelper.validate.required('email'),
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
  const tokenUnhashed = crypto.randomBytes(32).toString('hex');

  this.token = crypto.createHash('sha256').update(tokenUnhashed).digest('hex');

  return tokenUnhashed;
};

const UnverifiedUser = mongoose.model('NewUserToken', unverifiedUserSchema);

module.exports = UnverifiedUser;
