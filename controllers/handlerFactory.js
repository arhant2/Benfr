const APIFeatures = require('../utils/APIFeaturs');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const capitilize = (val) =>
  val.charAt(0).toUpperCase() + val.substring(1, val.length).toLowerCase();

const error404 = (docName) =>
  new AppError(`No ${docName} found with with that ID`, 404);

module.exports = (
  Model,
  singularNameParam = 'document',
  pluralNameParam = 'document'
) => {
  const singularName = {
    small: singularNameParam.toLowerCase(),
    capital: capitilize(singularNameParam),
  };
  const pluralName = {
    small: pluralNameParam.toLowerCase(),
    capital: capitilize(pluralNameParam),
  };

  return {
    getAll: catchAsync(async (req, res, next) => {
      const features = new APIFeatures(Model.find(), req.query)
        .filter()
        .sort()
        .paginate()
        .limitFields();

      const docs = await features.mongooseQuery;

      res.status(200).json({
        status: 'success',
        results: docs.length,
        data: {
          [pluralName.small]: docs,
        },
      });
    }),

    getOne: catchAsync(async (req, res, next) => {
      const doc = await Model.findById(req.params.id);

      if (!doc) {
        return next(error404(singularName.capital));
      }

      res.status(200).json({
        status: 'success',
        data: {
          [singularName.small]: doc,
        },
      });
    }),

    deleteOne: catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndDelete(req.params.id);

      if (!doc) {
        return next(error404(singularName.capital));
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });
    }),

    updateOne: catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!doc) {
        return next(error404(singularName.capital));
      }

      res.status(200).json({
        status: 'success',
        data: {
          [singularName.small]: doc,
        },
      });
    }),

    updateOneUsingSave: catchAsync(async (req, res, next) => {
      const doc = await Model.findById(req.params.id);

      const { body } = req;

      Object.keys(body).forEach((arg) => {
        doc[arg] = body[arg];
      });

      await doc.save();

      const updatedDoc = Model.findById(req.params.id);

      if (!doc) {
        return next(error404(singularName.capital));
      }

      res.status(200).json({
        status: 'success',
        data: {
          [singularName.small]: updatedDoc,
        },
      });
    }),

    createOne: catchAsync(async (req, res, next) => {
      const doc = await Model.create(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          [singularName.small]: doc,
        },
      });
    }),
  };
};
