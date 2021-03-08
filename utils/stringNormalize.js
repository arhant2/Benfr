const capitilize = require('./capitilize');

const toArray = (text) => {
  return text
    .split(/[^a-zA-Z0-9]/)
    .filter((el) => el.length)
    .map(capitilize);
};

const toString = (text, join = '-') => {
  return toArray(text).join(join);
};

module.exports = {
  toArray,
  toString,
};
