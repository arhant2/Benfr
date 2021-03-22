const qs = require('qs');

const catchAsync = require('../../utils/catchAsync');
const APIFeatures = require('../../utils/APIFeatures');

// queryObjParsed = {page, sort, filter, filterStringified, prevLink, nextLink}
module.exports = (Model, { pluralName }) => {
  return catchAsync(async (req, res, next) => {
    // console.log(req.query);

    const queryObjParsed = {};

    queryObjParsed.filterStringified = qs.stringify(queryObjParsed.filter, {
      encode: false,
    });

    const features = new APIFeatures(
      Model.find(),
      req.query,
      undefined,
      queryObjParsed
    )
      .filter()
      .sort()
      .paginate();

    const documents = await features.mongooseQuery;

    const addFilter = (str) => {
      if (queryObjParsed.filterStringified) {
        str += `&${queryObjParsed.filterStringified}`;
      }
      return str;
    };

    if (queryObjParsed.page > 1) {
      queryObjParsed.prevLink = addFilter(
        `/a/${pluralName.small}?page=${queryObjParsed.page * 1 - 1}&limit=${
          queryObjParsed.limit
        }&sort=${queryObjParsed.sort}`
      );
    }

    if (documents.length >= queryObjParsed.limit) {
      queryObjParsed.nextLink = addFilter(
        `/a/${pluralName.small}?page=${queryObjParsed.page * 1 + 1}&limit=${
          queryObjParsed.limit
        }&sort=${queryObjParsed.sort}`
      );
    }

    // console.log(queryObjParsed);

    res.render(`admin/${pluralName.small}`, {
      documents,
      queryObjParsed,
    });
  });
};
