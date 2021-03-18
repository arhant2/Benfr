const filterBodyMiddleware = require('../utils/filterBodyMiddleware');

exports.createOne = filterBodyMiddleware(['name', 'score']);

exports.updateOne = filterBodyMiddleware(['name', 'score', 'deleteImage0']);
