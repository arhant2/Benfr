const filterBodyMiddleware = require('../utils/filterBodyMiddleware');

exports.checkout = filterBodyMiddleware(['address', 'products']);
