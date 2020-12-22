const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

module.exports = (Model, { singularName }) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(
        new AppError(`No ${singularName.capital} found with with that ID`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        [singularName.small]: doc,
      },
    });
  });
};
