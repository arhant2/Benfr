const getIds = (obj) => {
  if (typeof obj === 'object') {
    return { id: obj.id, _id: obj._id };
  }
  return obj;
};

module.exports = (data) => {
  if (process.env.NODE_ENV === 'development') {
    return data;
  }

  if (!data) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((el) => getIds(el));
  }

  if (typeof data === 'object') {
    return getIds(data);
  }

  return data;
};
