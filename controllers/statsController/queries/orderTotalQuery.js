const Order = require('../../../models/orderModel');

// returns array with [{value, type}]
module.exports = ({ prevTime, startTime, endTime }) => {
  return Order.aggregate([
    {
      $match: {
        'status.name': { $ne: 'cancelled' },
        createdAt: { $gte: prevTime, $lt: endTime },
      },
    },
    {
      $addFields: {
        type: {
          $cond: [{ $lt: ['$createdAt', startTime] }, 'previous', 'current'],
        },
      },
    },
    {
      $group: {
        _id: '$type',
        value: { $sum: 1 },
      },
    },
    {
      $addFields: { type: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
  ]);
};
