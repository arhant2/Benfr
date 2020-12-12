module.exports = (inp, obj) => {
  const filteredObj = {};
  let arr = inp;
  if (!Array.isArray(inp)) {
    if (inp === 'string') {
      arr = inp.split(' ');
    } else {
      arr = {};
    }
  }
  arr.forEach((el) => {
    if (obj[el]) {
      filteredObj[el] = obj[el];
    }
  });
  return filteredObj;
};
