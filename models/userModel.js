const mongoose = require('mongoose');
const validator = require('validator');
const brcypt = require('bcryptjs');
const ms = require('ms');

const Email = require('../utils/email');
const AppError = require('../utils/AppError');
const otpGenerate = require('../utils/otpGenerate');
const userDetailsOptions = require('./helpers/userDetailsOptions')(
  'user',
  'users'
);

const { createRandomString, createHash } = require('../utils/crytography');

const userSchema = new mongoose.Schema(
  {
    name: userDetailsOptions.name(),
    email: userDetailsOptions.email(),
    mobile: userDetailsOptions.mobile(),
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'User must have a password'],
      validate: {
        validator: function () {
          if (this.isModified('password') && !this.passwordConfirm) {
            return false;
          }
          return true;
        },
        message: 'User must confirm his/her password',
      },
    },
    passwordConfirm: {
      type: String,
      minlength: [8, 'Password must be of atleast 8 characters'],
      maxlength: [50, 'Password must be of 50 characters at maximum'],
      // required: [true, 'User must confirm his/her password'],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: 'Password and confirm password must be same',
      },
    },
    passwordChangedAt: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    active: {
      type: Boolean,
      default: true,
    },
    inActiveReason: {
      type: String,
      minlength: [5, 'Inactive reason must be of atleast 5 characters'],
      maxlength: [120, 'Inactive reason must be of 120 characters at maximum'],
      trim: true,
    },
    failedLoginAttempts: {
      countResetAt: {
        type: Date,
        default: Date.now(),
      },
      attemptsRemaining: {
        type: Number,
        default: process.env.MAXIMUM_FAILED_LOGIN_ATTEMPTS_COUNT,
      },
    },
    changeEmailAttemptsNew: {
      countResetAt: {
        type: Date,
        default: Date.now(),
      },
      attemptsRemaining: {
        type: Number,
        default: process.env.MAXIMUM_CHANGE_EMAIL_ATTEMPTS_IN_A_DAY,
      },
    },
    changeEmailDetails: {
      attemptsRemaining: Number,
      validTill: Date,
      old: {
        email: String,
        otp: String,
        remainingOtpCount: Number,
      },
      new: {
        email: String,
        otp: String,
        remainingOtpCount: Number,
      },
    },
    deletedReviewCount: {
      type: Number,
      default: 0,
    },
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

// If the role is tried to be modified, always make it user
userSchema.pre('save', function (next) {
  if (this.isModified('role')) {
    this.role = 'user';
  }
  next();
});

// hide inactive users from  output and normalizeEmail
// userSchema.pre(/^find/, function (next) {
//   if (this.getFilter().active === undefined) {
//     this.find({ active: true });
//   }

//   next();
// });

// If admin is there, it should be always active, active user should not have inActiveReason
userSchema.pre('save', function (next) {
  if (!this.isModified('active')) {
    return next();
  }

  if (this.role === 'admin') {
    this.active = true;
  }

  if (this.active === true) {
    this.inActiveReason = undefined;
    this.wasReactivated = true;
  } else if (!this.inActiveReason) {
    throw new AppError(
      'There must be some reason for making user inactive',
      400
    );
  } else {
    this.wasMadeInactiveByAdmin = true;
  }

  next();
});

// password change management
userSchema.pre(/^save/, async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await brcypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.passwordResetExpires = undefined;
  this.passwordResetToken = undefined;
  this.passwordChangedAt = Date.now() - 1000; // (Hack)
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('deletedReviewCount')) return next();
  if (
    this.deletedReviewCount <
    process.env.MAXIMUM_DELTED_REVIEW_BEFORE_ACCOUNT_SUSPENSION
  )
    return next();

  this.active = false;
  this.inActiveReason = `Auto suspension. Detected as a spammers. Auto deleted ${this.deletedReviewCount} reviews.`;

  this.wasMadeInactiveDueToSpamming = true;

  this.deletedReviewCount = 0;
});

userSchema.post('save', async function (doc, next) {
  try {
    // Suspension due to spamming
    if (doc.wasMadeInactiveDueToSpamming) {
      await new Email(
        doc,
        doc.baseUrlForEmail
      ).sendAccountSuspesionAlertDueToSpamming();
    }
    // Suspension done by admin
    else if (doc.wasMadeInactiveByAdmin) {
      await new Email(
        doc,
        doc.baseUrlForEmail
      ).sendAccountSuspesionAlertByAdmin({ reason: doc.inActiveReason });
    }
    // Reactivation
    else if (doc.wasReactivated) {
      await new Email(doc, doc.baseUrlForEmail).sendAccountReactivationAlert();
    }
  } catch (err) {
    // Nothing
  }

  next();
});

userSchema.methods.createToken = function () {
  const tokenUnhashed = createRandomString(32);
  this.passwordResetToken = createHash(tokenUnhashed);
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

userSchema.methods.failedLoginAttemptsReset = function () {
  this.failedLoginAttempts = {
    countResetAt:
      Date.now() + ms(process.env.MAXIMUM_FAILED_LOGIN_ATTEMPTS_TIME),
    attemptsRemaining: process.env.MAXIMUM_FAILED_LOGIN_ATTEMPTS_COUNT,
  };
};

userSchema.methods.failedLoginAttemptsExceeded = function () {
  if (this.failedLoginAttempts.countResetAt < Date.now()) {
    // reset failed login attempts
    this.failedLoginAttemptsReset();
  }
  if (this.failedLoginAttempts.attemptsRemaining <= 0) {
    return true;
  }
  this.failedLoginAttempts.attemptsRemaining -= 1;
  return false;
};

userSchema.methods.changeEmailAttemptsNewReset = function () {
  this.changeEmailAttemptsNew = {
    countResetAt: Date.now() + ms('24h'),
    attemptsRemaining: process.env.MAXIMUM_FAILED_EMAIL_CHANGE_ATTEMPTS_COUNT,
  };
};

userSchema.methods.emailChangeNewAttemptsExceeded = function () {
  if (this.changeEmailAttemptsNew.countResetAt < Date.now()) {
    // reset
    this.changeEmailAttemptsNewReset();
  }
  if (this.changeEmailAttemptsNew.attemptsRemaining <= 0) {
    return true;
  }
  this.changeEmailAttemptsNew.attemptsRemaining -= 1;
  return false;
};

userSchema.methods.changeEmailOtpCreator = function (newEmail) {
  newEmail = validator.normalizeEmail(newEmail);
  const oldEmailOtp = otpGenerate(6);
  const newEmailOtp = otpGenerate(6);
  this.changeEmailDetails = {
    validTill: Date.now() + ms(process.env.OTP_EXPIRES_IN),
    attemptsRemaining: process.env.MAXIMUM_FAILED_EMAIL_CHANGE_ATTEMPTS_COUNT,
    old: {
      email: this.email,
      otp: createHash(oldEmailOtp + process.env.OTP_SECRET),
      remainingOtpCount: process.env.MAXIMUM_OTP_COUNT - 1,
    },
    new: {
      email: newEmail,
      otp: createHash(newEmailOtp + process.env.OTP_SECRET),
      remainingOtpCount: process.env.MAXIMUM_OTP_COUNT - 1,
    },
  };
  return { oldEmailOtp, newEmailOtp };
};

// userSchema.methods.resendOtpGenerator = function (type) {};

userSchema.methods.areValidEmailsForChangeEmail = function (
  oldEmail,
  newEmail
) {
  if (
    this.changeEmailDetails.expiresAt < Date.now() ||
    this.email !== oldEmail ||
    this.changeEmailDetails.old.email !== oldEmail ||
    this.changeEmailDetails.new.email !== newEmail
  ) {
    return false;
  }
  return true;
};

userSchema.methods.emailChangeVerifyExceeded = function () {
  if (this.changeEmailDetails.attemptsRemaining <= 0) {
    return true;
  }
  this.changeEmailDetails.attemptsRemaining -= 1;
  return false;
};

userSchema.methods.areValidOtpsForEmailChange = function (
  oldEmailOtp,
  newEmailOtp
) {
  const oldEmailOtpHashed = createHash(oldEmailOtp + process.env.OTP_SECRET);
  const newEmailOtpHashed = createHash(newEmailOtp + process.env.OTP_SECRET);
  return (
    this.changeEmailDetails.old.otp === oldEmailOtpHashed &&
    this.changeEmailDetails.new.otp === newEmailOtpHashed
  );
};

userSchema.methods.otpResendExceeded = function (type) {
  type = type.toLowerCase();
  if (this.changeEmailDetails[type].remainingOtpCount <= 0) {
    return true;
  }
  this.changeEmailDetails[type].remainingOtpCount -= 1;
  return false;
};

userSchema.methods.recreateOtpForEmailChange = function (type) {
  type = type.toLowerCase();
  const otp = otpGenerate(6);
  this.changeEmailDetails[type].otp = createHash(otp + process.env.OTP_SECRET);
  return otp;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
