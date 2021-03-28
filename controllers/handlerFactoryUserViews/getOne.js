const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

module.exports = (Model, { singularName }) => {
  return catchAsync(async (req, res, next) => {
    const document = await Model.findById(req.params.id);

    if (!document) {
      return next(
        new AppError(`No ${singularName.capital} found with with that ID`, 404)
      );
    }

    // console.log(document);

    res.render(`user/${singularName.small}-one`, {
      document,
    });
  });
};
