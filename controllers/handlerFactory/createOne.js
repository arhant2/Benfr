const sanitizeOutputDataToIncludeOnlyIds = require('../../utils/sanitizeOutputDataToIncludeOnlyIds');
const catchAsync = require('../../utils/catchAsync');
const { deleteFilesCloudinary } = require('../../cloudinary');

module.exports = (Model, { singularName }) => {
  return catchAsync(async (req, res, next) => {
    try {
      if (req.files) {
        req.body.images = [];

        Object.keys(req.files).forEach((key) => {
          req.body.images[Number(key.substring(5))] = req.files[key];
        });

        req.body.images = [...req.body.images].filter((el) => el !== undefined);
      }

      // console.log(req.body);

      const doc = await Model.create(req.body);

      res.status(201).json({
        status: 'success',
        message: `Sucessfully created ${singularName.small}`,
        data: {
          [singularName.small]: sanitizeOutputDataToIncludeOnlyIds(doc),
        },
      });
    } catch (err) {
      await deleteFilesCloudinary(req.files);
      throw err;
    }
  });
};
