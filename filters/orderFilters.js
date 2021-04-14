const filterBodyMiddleware = require('../utils/filterBodyMiddleware');

exports.checkout = filterBodyMiddleware(['address', 'products']);

exports.nextStage = filterBodyMiddleware(['currentStage', 'products']);

exports.cancelOrder = filterBodyMiddleware(['reason']);
