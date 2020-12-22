const capitilize = require('./capitilize');

module.exports = (singularNameParam, pluralNameParam) => {
  if (pluralNameParam === undefined || pluralNameParam === null) {
    pluralNameParam = singularNameParam;
  }
  return {
    singularName: {
      small: singularNameParam.toLowerCase(),
      capital: capitilize(singularNameParam),
    },
    pluralName: {
      small: pluralNameParam.toLowerCase(),
      capital: capitilize(pluralNameParam),
    },
  };
};
