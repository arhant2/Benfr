const moment = require('moment-timezone');

exports.dateTimeDayFormatted = (date) =>
  moment(date).tz('Asia/Kolkata').format('dddd, MMMM Do YYYY, h:mm:ss a');

exports.dateFormatted = (date) =>
  moment(date).tz('Asia/Kolkata').format('Do MMMM, YYYY');
