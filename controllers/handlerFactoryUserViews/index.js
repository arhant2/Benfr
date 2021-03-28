const singularPluralManager = require('../../utils/singularPluralManager');

const getAll = require('./getAll');
const getOne = require('./getOne');

module.exports = (
  Model,
  singularNameParam = 'document',
  pluralNameParam = 'document'
) => {
  const singularPluaralObj = singularPluralManager(
    singularNameParam,
    pluralNameParam
  );

  return {
    getAll: getAll(Model, singularPluaralObj),
    getOne: getOne(Model, singularPluaralObj),
  };
};
