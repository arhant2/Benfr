module.exports = (arr, unnecessary = []) => {
  const cannotTake = {};
  const ans = [];
  unnecessary.forEach((el) => {
    cannotTake[el] = true;
  });
  arr.forEach((el) => {
    if (!cannotTake[el]) {
      ans.push(el);
      cannotTake[el] = true;
    }
  });
  return ans;
};
