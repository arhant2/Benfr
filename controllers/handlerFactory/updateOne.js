const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

module.exports = (Model, { singularName }) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

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
