module.exports = (arr, obj) => {
  const filteredObj = {};
  arr.forEach((el) => {
    if (obj[el]) {
      filteredObj[el] = el;
    }
  });
  return filteredObj;
};
