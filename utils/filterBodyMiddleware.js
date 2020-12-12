const filterBody = require('./filterBody');

module.exports = (arr) => {
  return (req, res, next) => {
    req.body = filterBody(arr, req.body);
    next();
  };
};
