const filterBodyMiddleware = require('../utils/filterBodyMiddleware');

exports.updateMe = filterBodyMiddleware(['name', 'mobile']);

exports.makeUserActive = filterBodyMiddleware([]);

exports.makeUserInactive = filterBodyMiddleware(['inActiveReason']);
