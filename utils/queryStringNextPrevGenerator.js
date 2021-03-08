const querystring = require('querystring');

module.exports = (pageLimitObj, sortOriginal, currentCount) => {
  return {
    querystringPrev:
      pageLimitObj.page !== '1'
        ? querystring
            .encode({
              page: 1 * pageLimitObj.page - 1,
              limit: pageLimitObj.limit,
              sort: sortOriginal,
            })
            .replace(/%2C/g, ',')
        : undefined,

    querystringNext:
      currentCount === Number(pageLimitObj.limit)
        ? querystring
            .encode({
              page: 1 * pageLimitObj.page + 1,
              limit: pageLimitObj.limit,
              sort: sortOriginal,
            })
            .replace(/%2C/g, ',')
        : undefined,
  };
};
