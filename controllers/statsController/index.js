const sanitizeOutputDataToIncludeOnlyIds = require('../../utils/sanitizeOutputDataToIncludeOnlyIds');
const catchAsync = require('../../utils/catchAsync');

const durationResolver = require('./durationResolver');
const dateResolver = require('./dateResolver');

const generalQueryCaller = require('./queries/generalQueryCaller');
const customerTotalQuery = require('./queries/customerTotalQuery');
const newUserTotalQuery = require('./queries/newUserTotalQuery');
const orderTotalQuery = require('./queries/orderTotalQuery');
const salesTotalQuery = require('./queries/salesTotalQuery');
const visitorsTotalQuery = require('./queries/visitorsTotalQuery');

const totalSalesDiscrete = require('./totalSalesDiscrete');

exports.attachStats = catchAsync(async (req, res, next) => {
  const duration = durationResolver(req.query.duration);
  const datesResolved = dateResolver(req.query.date, duration);

  const allQueriesArr = await Promise.all([
    generalQueryCaller('customer', customerTotalQuery(datesResolved)),
    generalQueryCaller('newUser', newUserTotalQuery(datesResolved)),
    generalQueryCaller('order', orderTotalQuery(datesResolved)),
    generalQueryCaller('sales', salesTotalQuery(datesResolved)),
    generalQueryCaller('visitors', visitorsTotalQuery(datesResolved)),
  ]);

  const totalSalesDiscreteStats = await totalSalesDiscrete(
    duration,
    datesResolved
  );

  const stats = {};

  allQueriesArr.forEach(({ name, previous, current }) => {
    stats[name] = { previous, current };
  });

  req.customs.statsData = {
    duration,
    dates: datesResolved,
    stats,
    totalSalesDiscreteStats,
  };

  next();
});

exports.getStats = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      statsData: sanitizeOutputDataToIncludeOnlyIds(req.customs.statsData),
    },
  });
};
