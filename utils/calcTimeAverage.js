const ms = require('ms');

module.exports = (time, averageBy = '1ms') => {
  const milliseconds = ms(averageBy);

  return new Date(
    Math.floor(new Date(time).getTime() / milliseconds) * milliseconds
  );
};
