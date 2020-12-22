const APIFeatures = require('../../utils/APIFeaturs');
const catchAsync = require('../../utils/catchAsync');

module.exports = (Model, { pluralName }) => {
  return catchAsync(async (req, res, next) => {
    const features = new APIFeatures(
      Model.find(req.customs.getAllQuery),
      req.query
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
