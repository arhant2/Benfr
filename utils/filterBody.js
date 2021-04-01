const makeEmptyStringToNull = (obj) => {
  Object.entries(obj).forEach(([key, value]) => {
    if (value && typeof value === 'object') {
      makeEmptyStringToNull(value);
    } else if (value === '') {
      obj[key] = null;
    }
  });
};

module.exports = (inp, obj) => {
  const filteredObj = {};
  let arr = inp;
  if (!Array.isArray(inp)) {
    if (inp === 'string') {
      arr = inp.split(' ');
    } else {
      arr = [];
    }
  }
  arr.forEach((el) => {
    if (obj[el] !== undefined) {
      filteredObj[el] = obj[el];
    }
  });
  makeEmptyStringToNull(filteredObj);
  return filteredObj;
};
