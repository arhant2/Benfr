const ms = require('ms');
const moment = require('moment-timezone');

const dateFormator = require('../../utils/dateFormator');

// Useful constants
const istUtcDiff = ms('5 hours') + ms('30 mins');
const msInDay = ms('1 day');

// Return 12am ist of today/dateQuery, timestamp
const dateFromQuery = (dateQuery, isNotQuery = false) => {
  let dateGot = new Date(dateQuery);

  if (isNotQuery) {
    dateGot = new Date(
      Math.floor((dateGot.getTime() + istUtcDiff) / msInDay) * msInDay -
        istUtcDiff
    );
  } else if (
    Number.isNaN(dateGot.getTime()) ||
    typeof dateQuery !== 'string' ||
    !dateQuery.match(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/)
  ) {
    // console.log(new Date(Date.now()));
    dateGot = new Date(
      Math.floor((Date.now() + istUtcDiff) / msInDay) * msInDay - istUtcDiff
    );
  } else {
    dateGot = new Date(dateGot.getTime() - istUtcDiff);
  }

  return dateGot;
};

// Returns 12am ist provided date string
const get12AmIst = (dateString) => {
  return new Date(new Date(dateString).getTime() - istUtcDiff);
};

// Date resolver called by main function
module.exports = (dateQuery, duration) => {
  const dateQueryParsed = dateFromQuery(dateQuery);

  const year =
    dateFormator.generalDateTimeFormatted(dateQueryParsed, 'YYYY') * 1;

  const month =
    dateFormator.generalDateTimeFormatted(dateQueryParsed, 'MM') * 1;

  let startTime;
  let currentDateRange;

  if (duration === 'year') {
    startTime = get12AmIst(`${year}-01-01`);
    currentDateRange = dateFormator.generalDateTimeFormatted(startTime, 'YYYY');
  } else if (duration === 'month') {
    startTime = get12AmIst(`${year}-${month < 10 ? '0' : ''}${month}-01`);
    currentDateRange = dateFormator.generalDateTimeFormatted(
      startTime,
      'MMMM YYYY'
    );
  } else if (duration === 'week') {
    startTime = new Date(moment(dateQueryParsed).subtract(6, 'days').valueOf());

    currentDateRange = `${dateFormator.dateFormatted(
      startTime,
      'Mo YYYY'
    )} - ${dateFormator.dateFormatted(
      new Date(moment(startTime).add(6, 'days').valueOf()),
      'Mo YYYY'
    )}`;
  } else {
    startTime = dateQueryParsed;

    if (startTime.getTime() === dateFromQuery(Date.now(), true).getTime()) {
      currentDateRange = 'Today';
    } else if (
      startTime.getTime() ===
      dateFromQuery(Date.now(), true).getTime() - msInDay
    ) {
      currentDateRange = 'Yesterday';
    } else {
      currentDateRange = dateFormator.dateFormatted(startTime);
    }
  }

  const prevTime = new Date(moment(startTime).subtract(1, duration).valueOf());

  const endTime = new Date(moment(startTime).add(1, duration).valueOf());

  let prevDate = dateFormator.generalDateTimeFormatted(
    moment(startTime).subtract(1, duration).valueOf(),
    'YYYY-MM-DD'
  );

  let nextDate = dateFormator.generalDateTimeFormatted(endTime, 'YYYY-MM-DD');

  if (duration === 'week') {
    prevDate = dateFormator.generalDateTimeFormatted(
      new Date(moment(startTime).subtract(1, 'day').valueOf()),
      'YYYY-MM-DD'
    );
    nextDate = dateFormator.generalDateTimeFormatted(
      new Date(moment(endTime).add(6, 'day').valueOf()),
      'YYYY-MM-DD'
    );
  }

  return { prevTime, startTime, endTime, prevDate, nextDate, currentDateRange };
};
