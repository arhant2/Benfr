const singularPluralManager = require('../../utils/singularPluralManager');

const getAll = require('./getAll');
const getOne = require('./getOne');
const getNewForm = require('./getNewForm');

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
    getNewForm: getNewForm(Model, singularPluaralObj),
  };
};
