const filterBodyMiddleware = require('../utils/filterBodyMiddleware');

exports.createOne = filterBodyMiddleware(['name', 'mobile', 'address']);
exports.updateOne = filterBodyMiddleware(['name', 'mobile', 'address']);
