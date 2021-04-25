const moment = require('moment-timezone');

const Order = require('../../models/orderModel');
const dateFormator = require('../../utils/dateFormator');

function daysInMonthCalc(month, year) {
  return new Date(year, month, 0).getDate();
}

const monthsOfYear = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const getDurationField = (duration) => {
  if (duration === 'day') {
    return '$hour';
  }
  if (duration === 'week') {
    return '$dayOfMonth';
  }
  if (duration === 'month') {
    return '$dayOfMonth';
  }
  if (duration === 'year') {
    return '$month';
  }
};

/// Day resolver
const dayResolver = (aggregationVal) => {
  const ans = [];

  for (let i = 0; i < 24; i += 1) {
    ans.push({
      title: i,
      value: 0,
    });
  }

  aggregationVal.forEach(({ title: hour, value }) => {
    ans[hour].value = value;
  });

  return ans;
};

/// Week resolver
const weekResolver = (aggregationVal, { startTime }) => {
  let ans = [];

  let time = startTime;

  for (let i = 0; i < 7; i += 1) {
    ans.push({
      title: dateFormator.generalDateTimeFormatted(time, 'DD MMM'),
      value: 0,
      day: dateFormator.generalDateTimeFormatted(time, 'DD') * 1,
    });

    time = new Date(moment(time).add(1, 'day').toDate());
  }

  aggregationVal.forEach(({ value, title }) => {
    ans.find(({ day }) => day === title).value = value;
  });

  ans = ans.map(({ title, value }) => ({ title, value }));

  return ans;
};

/// Month resolver
const monthResolver = (aggregationVal, { startTime }) => {
  const daysInMonth = daysInMonthCalc(
    dateFormator.generalDateTimeFormatted(startTime, 'MM') * 1,
    dateFormator.generalDateTimeFormatted(startTime, 'YYYY') * 1
  );

  const ans = [];

  for (let i = 1; i <= daysInMonth; i += 1) {
    ans.push({
      title: i,
      value: 0,
    });
  }

  aggregationVal.forEach(({ title: day, value }) => {
    ans[day - 1].value = value;
  });

  return ans;
};

/// Year resolver
const yearResolver = (aggregationVal) => {
  const ans = monthsOfYear.map((month) => ({ title: month, value: 0 }));

  aggregationVal.forEach(({ title: monthNum, value }) => {
    ans[monthNum - 1].value = value;
  });

  return ans;
};

module.exports = async (duration, { startTime, endTime }) => {
  const aggregationVal = await Order.aggregate([
    {
      $match: {
        'status.name': { $ne: 'cancelled' },
        createdAt: { $gte: startTime, $lt: endTime },
      },
    },
    {
      $group: {
        _id: {
          [getDurationField(duration)]: {
            date: '$createdAt',
            timezone: 'Asia/Kolkata',
          },
        },
        value: { $sum: '$grandTotal' },
      },
    },
    {
      $addFields: { title: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
  ]);

  if (duration === 'day') {
    return dayResolver(aggregationVal);
  }
  if (duration === 'week') {
    return weekResolver(aggregationVal, { startTime });
  }
  if (duration === 'month') {
    return monthResolver(aggregationVal, { startTime });
  }
  return yearResolver(aggregationVal);
};
