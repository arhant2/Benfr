const filterBodyMiddleware = require('../utils/filterBodyMiddleware');

exports.updateMe = filterBodyMiddleware(['name', 'mobile']);
