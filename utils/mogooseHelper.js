const validateRaw = () => {
  return {
    isMobilePhone: (val) =>
      val.match(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/),
  };
};

const validate = (modelName) => {
  return {
    required: (fieldName) => [true, `${modelName} must have a ${fieldName}`],
  };
};

const field = (modelName) => {
  return {
    minMaxString: (
      fieldName,
      minlength,
      maxlength,
      obj = {},
      required = true,
      trim = true
    ) => {
      const ans = { type: String, ...obj };
      if (minlength !== undefined) {
        ans.minlength = [
          minlength,
          `${fieldName} must have atleast ${minlength} or more characters`,
        ];
      }
      if (maxlength !== undefined) {
        ans.maxlength = [
          maxlength,
          `${fieldName} has atmost ${maxlength} or less characters`,
        ];
      }
      if (required === true) {
        ans.required = required
          ? validate(modelName).required(fieldName)
          : false;
      }
      if (trim === true) {
        ans.trim = true;
      }
      return ans;
    },

    minMaxNumber: (fieldName, min, max, obj = {}, required = true) => {
      const ans = { type: Number, ...obj };
      if (min !== undefined) {
        ans.min = [min, `${fieldName} must be greater than or equal to ${min}`];
      }
      if (max !== undefined) {
        ans.max = [max, `${fieldName} must be less than or equal to ${max}`];
      }
      if (required === true) {
        ans.required = required
          ? validate(modelName).required(fieldName)
          : false;
      }
      return ans;
    },

    mobilePhone: (fieldName, obj = {}, required = true) => {
      const ans = {
        type: String,
        validate: [validateRaw().isMobilePhone, 'Invalid Mobile Number'],
        set: (val) => val.substring(val.length - 10, val.length),
        trim: true,
        ...obj,
      };
      if (required === true) {
        ans.required = required
          ? validate(modelName).required(fieldName)
          : false;
      }
      return ans;
    },
  };
};

module.exports = (modelName) => {
  return {
    validate: validate(modelName),
    field: field(modelName),
    validateRaw: validateRaw(),
  };
};
