const filterBodyMiddleware = require('../utils/filterBodyMiddleware');

exports.createOne = filterBodyMiddleware(['star', 'description']);
exports.updateOne = filterBodyMiddleware(['star', 'description']);
exports.likeReview = filterBodyMiddleware([]);
exports.unlikeReview = filterBodyMiddleware([]);
exports.markReview = filterBodyMiddleware([]);
exports.unmarkReview = filterBodyMiddleware([]);
