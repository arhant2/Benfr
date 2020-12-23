const APIFeatures = require('../../utils/APIFeatures');
const catchAsync = require('../../utils/catchAsync');

module.exports = (Model, { pluralName }) => {
  return catchAsync(async (req, res, next) => {
    const features = new APIFeatures(
      Model.find(),
      req.query,
      req.customs.getAllQuery
    )
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
  });
};
