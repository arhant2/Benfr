const validator = require('validator');

const capitilize = require('../../utils/capitilize');
const singularPluralManager = require('../../utils/singularPluralManager');

module.exports = (singularNameParam, pluralNameParam = undefined) => {
  const { singularName } = singularPluralManager(
    singularNameParam,
    pluralNameParam
  );

  const requiredOption = (required, field) =>
    required ? [true, `${singularName.capital} must have a ${field}`] : false;

  return {
    name: (required = true) => ({
      type: String,
      minlength: [3, 'Name must have atleast 3 character'],
      maxlength: [40, 'Name can have atmost 40 characters'],
      trim: true,
      validate: [
        (val) => val.match(/^[a-zA-Z ]*$/),
        'Invalid name, name can contain only letters and spaces',
      ],
      set: (val) => {
        return val
          .split(' ')
          .filter((el) => el.length)
          .map(capitilize)
          .join(' ');
      },
      required: requiredOption(required, 'name'),
    }),

    mobile: (required = true) => ({
      type: String,
      validate: {
        validator: (val) =>
          val.match(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/),
        message: 'Invalid mobile number',
      },
      set: (val) => val.substring(val.length - 10, val.length),
      trim: true,
      required: requiredOption(required, 'mobile number'),
    }),

    email: (required = true) => ({
      type: String,
      validate: [validator.isEmail, 'Invalid email'],
      unique: true,
      trim: true,
      set: validator.normalizeEmail,
      required: requiredOption(required, 'email'),
    }),
  };
};
