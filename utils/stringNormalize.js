const toArray = (text) => {
  return text
    .toLowerCase()
    .split(/[^a-zA-Z0-9]/)
    .filter((el) => el.length);
};

const toString = (text, join = '-') => {
  return toArray(text).join(join);
};

module.exports = {
  toArray,
  toString,
};
