const ms = require('ms');

const Visitor = require('../models/visitorModel');
const catchAsync = require('../utils/catchAsync');
const calcTimeAverage = require('../utils/calcTimeAverage');

exports.manageVisitor = catchAsync(async (req, res, next) => {
  if (!req.cookies.visitorIdentifier) {
    await Visitor.increaseVisitor();

    res.cookie('visitorIdentifier', Math.floor(Math.random() * 1000000), {
      expires: calcTimeAverage(Date.now() + ms('24h'), '24h'),
    });
  }

  next();
});
