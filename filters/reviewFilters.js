const filterBodyMiddleware = require('../utils/filterBodyMiddleware');

exports.createOne = filterBodyMiddleware(['star', 'title', 'description']);
exports.updateOne = filterBodyMiddleware(['star', 'title', 'description']);
exports.likeReview = filterBodyMiddleware([]);
exports.unlikeReview = filterBodyMiddleware([]);
exports.markReview = filterBodyMiddleware([]);
exports.unmarkReview = filterBodyMiddleware([]);
