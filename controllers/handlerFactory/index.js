const singularPluralManager = require('../../utils/singularPluralManager');

const getAll = require('./getAll');
const getOne = require('./getOne');
const createOne = require('./createOne');
const updateOne = require('./updateOne');
const updateOneUsingSave = require('./updateOneUsingSave');
const deleteOne = require('./deleteOne');

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
    createOne: createOne(Model, singularPluaralObj),
    updateOne: updateOne(Model, singularPluaralObj),
    updateOneUsingSave: updateOneUsingSave(Model, singularPluaralObj),
    deleteOne: deleteOne(Model, singularPluaralObj),
  };
};
