const singularPluralManager = require('../../utils/singularPluralManager');

const getAll = require('./getAll');

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
  };
};
