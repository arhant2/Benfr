const filterBodyMiddleware = require('../utils/filterBodyMiddleware');

exports.createOne = filterBodyMiddleware(['name']);

exports.updateOne = filterBodyMiddleware(['name', 'deleteImage0']);
