const catchAsync = require('../../utils/catchAsync');
const APIFeatures = require('../../utils/APIFeatures');
const queryStringNextPrevGenerator = require('../../utils/queryStringNextPrevGenerator');

module.exports = (Model, { pluralName }) => {
  return (sortDefault = '-updatedAt', pageDefault = '1', limitDefault = '10') =>
    catchAsync(async (req, res, next) => {
      const page = req.query.page || pageDefault;
      const sortOriginal = req.query.sort || sortDefault;
      const sort = `${sortOriginal},${sortDefault}`;
      const limit = req.query.limit || limitDefault;

      const pageLimitObj = {};

      const features = new APIFeatures(Model.find(), {
        page,
        sort,
        limit,
      })
        .sort()
        .paginate(pageLimitObj);

      const documents = await features.mongooseQuery;

      const { querystringPrev, querystringNext } = queryStringNextPrevGenerator(
        pageLimitObj,
        sortOriginal,
        documents.length
      );

      res.render(`admin/${pluralName.small}`, {
        documents,
        querystringNext,
        page,
        querystringPrev,
        sort: sortOriginal,
        limit: pageLimitObj.limit,
      });
    });
};
