const qs = require('qs');

const catchAsync = require('../../utils/catchAsync');
const APIFeatures = require('../../utils/APIFeatures');

// res.locals = {displayName, encodedUrl}
// req.customs.getAll = {queryRestrict, sortDefault, limitDefault}
// queryObjParsed = {page, sort, filter, filterStringified, prevLink, nextLink}
module.exports = (Model, { pluralName }) => {
  return catchAsync(async (req, res, next) => {
    // console.log(req.query);

    const queryObjParsed = {};

    const features = new APIFeatures(
      Model.find(),
      req.query,
      req.customs.getAll && req.customs.getAll.queryRestrict,
      queryObjParsed
    )
      .filter()
      .sort(req.customs.getAll && req.customs.getAll.sortDefault)
      .paginate(req.customs.getAll && req.customs.getAll.limitDefault);

    const documents = await features.mongooseQuery;

    queryObjParsed.filterStringified = qs.stringify(queryObjParsed.filter, {
      encode: false,
    });

    const addFilter = (str) => {
      if (queryObjParsed.filterStringified) {
        str += `&${queryObjParsed.filterStringified}`;
      }
      return str;
    };

    if (queryObjParsed.page > 1) {
      queryObjParsed.prevLink = addFilter(
        // eslint-disable-next-line prefer-template
        `${req.customs.path}?page=${queryObjParsed.page * 1 - 1}` +
          (queryObjParsed.limit ? `&limit=${queryObjParsed.limit}` : '') +
          (queryObjParsed.sort ? `&sort=${queryObjParsed.sort}` : '')
      );
    }

    if (documents.length >= queryObjParsed.limit) {
      queryObjParsed.nextLink = addFilter(
        // eslint-disable-next-line prefer-template
        `${req.customs.path}?page=${queryObjParsed.page * 1 + 1}` +
          (queryObjParsed.limit ? `&limit=${queryObjParsed.limit}` : '') +
          (queryObjParsed.sort ? `&sort=${queryObjParsed.sort}` : '')
      );
    }

    // console.log(queryObjParsed);

    res.render(`user/${pluralName.small}`, {
      documents,
      queryObjParsed,
    });
  });
};
