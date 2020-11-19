const crypto = require('crypto');

const mongoose = require('mongoose');
const validator = require('validator');
const brcypt = require('bcryptjs');
const ms = require('ms');

const mongooseHelper = require('../utils/mogooseHelper')('User');
const AppError = require('../utils/AppError');

const nameOptions = (type) => {
  return {
    validate: [validator.isAlpha, `Invalid ${type}`],
    set: (val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase(),
  };
};

const userSchema = new mongoose.Schema(
  {
    firstName: mongooseHelper.field.minMaxString(
      'First name',
      1,
      20,
      nameOptions('First Name')
    ),
    middleName: mongooseHelper.field.minMaxString(
      'Middle name',
      1,
      20,
      nameOptions('Middle Name'),
      false
    ),
    lastName: mongooseHelper.field.minMaxString(
      'Last name',
      1,
      20,
      nameOptions('Last Name')
    ),
    email: {
      type: String,
      validate: [validator.isEmail, 'Invalid email'],
      required: mongooseHelper.validate.required('email'),
      unique: true,
      trim: true,
      set: validator.normalizeEmail,
    },
    mobile: mongooseHelper.field.mobilePhone('Mobile number'),
    photo: String,
    role: {
      type: String,
      enum: ['deliveryPerson', 'user'],
      default: 'user',
      select: false,
    },
    password: mongooseHelper.field.minMaxString(
      'Password',
      8,
      100,
      {
        select: false,
      },
      true,
      false
    ),
    passwordConfirm: mongooseHelper.field.minMaxString(
      'Password confirm',
      8,
      100,
      {
        select: false,
        validate: [
          function (val) {
            return val === this.password;
          },
          'Password and confirm password must be same',
        ],
      },
      true,
      false
    ),
    profilePic: String,
    passwordChangedAt: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    inActiveReason: mongooseHelper.field.minMaxString(
      'Inactive Reason',
      5,
      120,
      {},
      false
    ),
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({
  passwordResetToken: 1,
});

userSchema.pre(/^find/, function (next) {
  if (this.getFilter().active === undefined) {
    this.find({ active: true });
  }

  if (this.getFilter().email) {
    let { email } = this.getFilter();
    if (!validator.isEmail(email)) {
      throw new AppError('Please enter a valid email', 400);
    }
    email = validator.normalizeEmail(email);
    this.find({ email });
  }
  next();
});

userSchema.pre(/^save/, async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await brcypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.passwordResetExpires = undefined;
  this.passwordResetToken = undefined;
  this.passwordChangedAt = Date.now() - 1000; // (Hack)
  next();
});

userSchema.methods.createToken = function () {
  const tokenUnhashed = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(tokenUnhashed)
    .digest('hex');

  this.passwordResetExpires =
    Date.now() + ms(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN);

  return tokenUnhashed;
};

userSchema.methods.isCorrectPassword = async function (candidatePassword) {
  return await brcypt.compare(candidatePassword, this.password);
};

userSchema.methods.hasChangedPasswordAfter = function (JWTTimeStamp) {
  const changedTimeStamp = parseInt(this.passwordChangedAt / 1000, 10);
  return JWTTimeStamp < changedTimeStamp;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
