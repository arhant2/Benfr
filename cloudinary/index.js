const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${Math.random()}.${file.mimetype.split('/')[1]}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: multerFilter,
});

const deleteFilesCloudinary = async (obj) => {
  if (!obj || !obj?.length) {
    return;
  }

  // For testing
  // (() => {
  //   const path = require('path');
  //   const fs = require('fs');
  //   const dateFormator = require('../utils/dateFormator');

  //   const data = JSON.parse(
  //     fs.readFileSync(
  //       path.join(__dirname, '../z__playground/deleteImages.json'),
  //       'utf-8'
  //     )
  //   );

  //   data.push(obj);
  //   data.push({
  //     time: dateFormator.dateTimeDayFormatted(Date.now()),
  //   });

  //   fs.writeFileSync(
  //     path.join(__dirname, '../z__playground/deleteImages.json'),
  //     JSON.stringify(data)
  //   );

  //   console.log(obj);
  // })();

  const res = await Promise.allSettled(
    Object.values(obj).map((el) => cloudinary.uploader.destroy(el.filename))
  );

  res.forEach((el) => {
    if (el.status === 'rejected') {
      console.log("🙁 Couldn't delete file from cloudinary!");
      console.log('Reason:', el.reason);
    }
  });
};

const uploadFilesCloudinaryMiddlware = (folder = 'benfr') =>
  catchAsync(async (req, res, next) => {
    if (!req.files) {
      return next();
    }

    req.files = JSON.parse(JSON.stringify(req.files));

    Object.keys(req.files).forEach((key) => {
      req.files[key] = req.files[key][0];
    });

    const filesAccepted = {};
    let anyFileRejected = false;

    await Promise.allSettled(
      Object.entries(req.files).map(async (entry) => {
        try {
          const resCloudinary = await promisify(cloudinary.uploader.upload)(
            entry[1].path,
            {
              folder,
            }
          );

          filesAccepted[entry[0]] = {
            path: resCloudinary.url,
            filename: resCloudinary.public_id,
          };
        } catch (err) {
          anyFileRejected = true;
        }
        await promisify(fs.unlink)(entry[1].path);
      })
    );

    if (anyFileRejected) {
      await deleteFilesCloudinary(filesAccepted);
      return next(new AppError('Something went wrong!', 500));
    }

    req.files = filesAccepted;
    next();
  });

const getThumbnailLink = (publicId) =>
  cloudinary.url(publicId, {
    width: 250,
    height: 250,
    quality: 'auto:low',
    crop: 'fit',
  });

const uploadThubmnail = async (publicIdOringinal, folder) => {
  const publicId = ((arr = publicIdOringinal.split('/')) =>
    arr[arr.length - 1])();

  const resCloudinary = await promisify(cloudinary.uploader.upload)(
    getThumbnailLink(publicIdOringinal),
    {
      folder,
      public_id: publicId,
      overwrite: false,
    }
  );

  return {
    path: resCloudinary.url,
    filename: resCloudinary.public_id,
  };

  try {
  } catch (err) {
    throw new AppError('Server error, please try again later', 500);
  }
};

module.exports = {
  cloudinary,
  upload,
  deleteFilesCloudinary,
  uploadFilesCloudinaryMiddlware,
  getThumbnailLink,
  uploadThubmnail,
};
