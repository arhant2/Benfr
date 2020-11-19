const moment = require('moment-timezone');

exports.dateTimeFormatted = (date) =>
  moment(date).tz('Asia/Kolkata').format('dddd, MMMM Do YYYY, h:mm:ss a');
