const filterBodyMiddleware = require('../utils/filterBodyMiddleware');

exports.addToCart = filterBodyMiddleware(['product']);

exports.putCart = filterBodyMiddleware(['products']);
