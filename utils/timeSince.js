// Calculations standard
const msPerSecond = 1000;
const msPerMinute = msPerSecond * 60;
const msPerHour = msPerMinute * 60;
const msPerDay = msPerHour * 24;
const msPerWeek = msPerDay * 7;
const msPerMonth = msPerDay * 30;
const msPerYear = msPerDay * 365.25;

// Durations
const durations = [
  {
    name: 'second',
    short: 'sec',
    ms: msPerSecond,
  },
  {
    name: 'minute',
    short: 'min',
    ms: msPerMinute,
  },
  {
    name: 'hour',
    short: 'hr',
    ms: msPerHour,
  },
  {
    name: 'day',
    short: 'dy',
    ms: msPerDay,
  },
  {
    name: 'week',
    short: 'wk',
    ms: msPerWeek,
  },
  {
    name: 'month',
    short: 'mo',
    ms: msPerMonth,
  },
  {
    name: 'year',
    short: 'yr',
    ms: msPerYear,
  },
];

module.exports = (time, long = true, format = 'since {time}') => {
  const elapsedMs = Date.now() - new Date(time);

  const getFormattedTimeString = (duration) => {
    const value = Math.floor(elapsedMs / duration.ms);
    const gap = long ? ' ' : '';
    let unit = long ? duration.name : duration.short;
    if (value > 1) {
      unit += 's';
    }
    return format.replace('{time}', `${value}${gap}${unit}`);
  };

  let formattedString = '';

  for (let i = 0; i < durations.length - 1; i += 1) {
    if (elapsedMs < durations[i + 1].ms) {
      formattedString = getFormattedTimeString(durations[i]);
      break;
    }
  }

  if (formattedString === '') {
    formattedString = getFormattedTimeString(durations[durations.length - 1]);
  }

  return formattedString;
};
