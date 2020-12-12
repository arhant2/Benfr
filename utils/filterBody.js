module.exports = (inp, obj) => {
  const filteredObj = {};
  let arr;
  if (!Array.isArray(inp)) {
    if (inp === 'string') {
      arr = inp.split(' ');
    } else {
      arr = {};
    }
  }
  arr.forEach((el) => {
    if (obj[el]) {
      filteredObj[el] = el;
    }
  });
  return filteredObj;
};
