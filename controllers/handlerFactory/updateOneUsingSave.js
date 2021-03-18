const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const { deleteFilesCloudinary } = require('../../cloudinary');

const handleImagesAndData = async (req, doc) => {
  const deleteIndices = Object.keys(req.body)
    .filter((arg) => arg.startsWith('deleteImage') && req.body[arg])
    .map((arg) => Number(arg.substring(11)));

  if (req.files || deleteIndices.length) {
    if (!doc.images) {
      doc.images = [];
    }

    const images = [];
    const deleteImages = [];

    doc.images.forEach((image, index) => {
      if (deleteIndices.includes(index)) {
        if (doc.images[index]) {
          deleteImages.push(doc.images[index]);
        }
        return;
      }
      if (doc.images[index]) {
        deleteImages.push(doc.images[index]);
      }
      images[index] = doc.images[index];
    });

    await deleteFilesCloudinary(deleteImages);

    Object.keys(req.files).forEach((key) => {
      images[Number(key.substring(5))] = req.files[key];
    });

    doc.images = [...images].filter((el) => el !== undefined);

    // console.log(doc.images);
  }

  Object.keys(req.body)
    .filter((arg) => !arg.startsWith('deleteImage'))
    .forEach((arg) => {
      // console.log(arg);
      doc[arg] = req.body[arg];
    });
};

module.exports = (Model, { singularName }) => {
  return catchAsync(async (req, res, next) => {
    try {
      const doc = req.customs.document || (await Model.findById(req.params.id));

      if (!doc) {
        return next(
          new AppError(
            `No ${singularName.capital} found with with that ID`,
            404
          )
        );
      }

      await handleImagesAndData(req, doc);

      // console.log(doc);

      await doc.save();

      // console.log(doc);
      // doc.images.filter((image) => image !== undefined);

      const updatedDoc = await Model.findById(req.params.id);

      if (!doc) {
        return next(
          new AppError(
            `No ${singularName.capital} found with with that ID`,
            404
          )
        );
      }

      res.status(200).json({
        status: 'success',
        message: `Updated ${singularName.small} successfully`,
        data: {
          [singularName.small]: updatedDoc,
        },
      });
    } catch (err) {
      await deleteFilesCloudinary(req.files);
      throw err;
    }
  });
};
