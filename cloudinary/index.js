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
  if (!obj) {
    return;
  }

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
              format: 'png',
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
      return next(AppError('Something went wrong!', 500));
    }

    req.files = filesAccepted;
    next();
  });

module.exports = {
  cloudinary,
  upload,
  deleteFilesCloudinary,
  uploadFilesCloudinaryMiddlware,
};
