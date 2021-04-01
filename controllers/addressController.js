const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Address = require('../models/addressModel');
const { locationDetails } = require('../utils/locationDetails');

const handlerFactory = require('./handlerFactory')(
  Address,
  'address',
  'address'
);

exports.attachUserForCreateOne = (req, res, next) => {
  req.body.user = req.customs.user.id;
  next();
};

exports.checkIfAddressBelongsTouser = catchAsync(async (req, res, next) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.customs.user.id,
  });
  if (!address) {
    return next(
      new AppError(
        'No address with specified details found associated with current user',
        404
      )
    );
  }
  req.customs.document = address;
  next();
});

exports.getAllMiddleware = (req, res, next) => {
  req.customs.getAll = {
    queryRestrict: {
      user: req.customs.user.id,
    },
  };
  next();
};

exports.getAll = handlerFactory.getAll;
// exports.getOne = handlerFactory.getOne;
exports.createOne = handlerFactory.createOne;
exports.updateOne = handlerFactory.updateOneUsingSave;
exports.deleteOne = handlerFactory.deleteOne;

exports.getAllLocations = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      locations: locationDetails,
    },
  });
};
