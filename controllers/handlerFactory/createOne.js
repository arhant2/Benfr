const catchAsync = require('../../utils/catchAsync');

module.exports = (Model, { singularName }) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        [singularName.small]: doc,
      },
    });
  });
};
