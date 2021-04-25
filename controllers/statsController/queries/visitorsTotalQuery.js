const Visitor = require('../../../models/visitorModel');

// returns array with [{value, type}]
module.exports = ({ prevTime, startTime, endTime }) => {
  return Visitor.aggregate([
    {
      $match: {
        timeAverage: { $gte: prevTime, $lt: endTime },
      },
    },
    {
      $addFields: {
        type: {
          $cond: [{ $lt: ['$timeAverage', startTime] }, 'previous', 'current'],
        },
      },
    },
    {
      $group: {
        _id: '$type',
        value: { $sum: '$count' },
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
