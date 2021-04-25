/// Returns duration from query
module.exports = (durationQuery) => {
  durationQuery = durationQuery?.toLowerCase();

  if (
    durationQuery === 'week' ||
    durationQuery === 'month' ||
    durationQuery === 'year'
  ) {
    return durationQuery;
  }

  return 'day';
};
